using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyWebApi.Services;
using NetServer.Data;
using NetServer.DAta1;
using System.Security.Claims;
using System.Text;
using Microsoft.Net.Http.Headers;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.RateLimiting;
using System.Security.Cryptography;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var maintenanceModeEnabled = IsMaintenanceModeEnabled(builder.Configuration);

        if (builder.Environment.IsDevelopment())
        {
            var developmentKeysPath = Path.Combine(builder.Environment.ContentRootPath, ".dev-keys");
            builder.Services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(developmentKeysPath))
                .SetApplicationName("DigitalAssetsMarket.Development");
        }

        string? jwtKey = builder.Configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            jwtKey = Environment.GetEnvironmentVariable("Jwt__Key")
                     ?? Environment.GetEnvironmentVariable("JWT__KEY")
                     ?? Environment.GetEnvironmentVariable("Jwt:Key");
        }

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            foreach (System.Collections.DictionaryEntry de in Environment.GetEnvironmentVariables())
            {
                var name = de.Key as string;
                var val = de.Value as string;
                if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(val))
                    continue;

                if (name.IndexOf("JWT", StringComparison.OrdinalIgnoreCase) >= 0 &&
                    (
                        name.Equals("JWT", StringComparison.OrdinalIgnoreCase) ||
                        name.IndexOf("KEY", StringComparison.OrdinalIgnoreCase) >= 0 ||
                        name.IndexOf("SECRET", StringComparison.OrdinalIgnoreCase) >= 0 ||
                        name.IndexOf("TOKEN", StringComparison.OrdinalIgnoreCase) >= 0))
                {
                    jwtKey = val;
                    break;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            if (!builder.Environment.IsDevelopment())
                throw new InvalidOperationException("Jwt:Key is missing. Set environment variable 'Jwt__Key' or configuration 'Jwt:Key'.");

            jwtKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
            builder.Configuration["Jwt:Key"] = jwtKey;
        }

        builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "dam_session";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.ExpireTimeSpan = TimeSpan.FromHours(1);
                options.SlidingExpiration = false;
                options.Events = new CookieAuthenticationEvents
                {
                    OnValidatePrincipal = async context =>
                    {
                        var userIdValue = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                        if (!Guid.TryParse(userIdValue, out var userId))
                        {
                            context.RejectPrincipal();
                            return;
                        }

                        await using var scope = context.HttpContext.RequestServices.CreateAsyncScope();
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        var user = await db.Users
                            .AsNoTracking()
                            .Where(u => u.Id == userId)
                            .Select(u => new { u.IsBanned })
                            .FirstOrDefaultAsync();

                        var sessionIdValue = context.Principal?.FindFirstValue("sid");
                        if (!Guid.TryParse(sessionIdValue, out var sessionId) ||
                            user == null || user.IsBanned ||
                            !await db.Sessions.AsNoTracking().AnyAsync(s =>
                                s.SessionId == sessionId && s.UserId == userId && s.ExpiresAt > DateTime.UtcNow))
                        {
                            context.RejectPrincipal();
                        }
                    },
                    OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    },
                    OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddControllers();

        builder.Services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy("AuthSensitive", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));
        });

        builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
        {
            options.SuppressModelStateInvalidFilter = true;
        });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // CORS
        string[] allowedOrigins = BuildAllowedOrigins(builder.Configuration);

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("FrontendCors", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            if (!builder.Environment.IsDevelopment())
            {
                throw new InvalidOperationException("Database connection string is missing.");
            }

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("DigitalAssetsMarketDevelopment"));
        }
        else
        {
            connectionString = NormalizePostgresConnectionString(connectionString);
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        var marketDataBaseUrl = builder.Configuration["MarketData:BinanceBaseUrl"];
        if (string.IsNullOrWhiteSpace(marketDataBaseUrl))
        {
            marketDataBaseUrl = "https://api.binance.com";
        }

        builder.Services.AddHttpClient<IMarketDataService, BinanceMarketDataService>(client =>
        {
            client.BaseAddress = new Uri(marketDataBaseUrl);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("DAM-PaperTrading/1.0");
        });

        builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
        builder.Services.AddScoped<WalletProvisioningService>();
        builder.Services.AddScoped<PaperTradingService>();
        builder.Services.AddHostedService<PaperTradingSettlementService>();

        var app = builder.Build();
        var startupLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
        var maintenancePagePath = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "maintenance.html");

        TryRunStartupInitialization(app.Services, startupLogger);

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("FrontendCors");

        app.Use(async (context, next) =>
        {
            if (!maintenanceModeEnabled)
            {
                await next();
                return;
            }

            if (context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "application/json";
                context.Response.Headers["Cache-Control"] = "no-store, no-cache";
                context.Response.Headers["Retry-After"] = "3600";
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "The service is temporarily unavailable because maintenance mode is enabled."
                });
                return;
            }

            if (!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                return;
            }

            if (!File.Exists(maintenancePagePath))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "text/plain; charset=utf-8";
                await context.Response.WriteAsync("Maintenance mode is enabled.");
                return;
            }

            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "text/html; charset=utf-8";
            context.Response.Headers["Cache-Control"] = "no-store, no-cache";
            context.Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
            await context.Response.SendFileAsync(maintenancePagePath);
        });

        // app.UseHttpsRedirection();

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.Use(async (context, next) =>
        {
            context.Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
            context.Response.Headers[HeaderNames.XFrameOptions] = "DENY";
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

            if (!context.Request.Path.StartsWithSegments("/swagger", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Headers["Content-Security-Policy"] = string.Join("; ",
                    "default-src 'self'",
                    "base-uri 'self'",
                    "frame-ancestors 'none'",
                    "object-src 'none'",
                    "script-src 'self'",
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com data:",
                    "img-src 'self' https: data: blob:",
                    "connect-src 'self' https://api.coingecko.com",
                    "form-action 'self'");
            }

            await next();
        });

        app.UseAuthentication();
        app.UseRateLimiter();
        app.UseAuthorization();

        app.MapGet("/healthz", () => Results.Ok(new
        {
            status = "ok",
            utc = DateTime.UtcNow
        })).AllowAnonymous();

        app.MapControllers();
        app.MapFallbackToFile("index.html");

        app.Run();
    }

    private static bool IsMaintenanceModeEnabled(IConfiguration configuration)
    {
        var rawValue =
            configuration["Maintenance:Enabled"] ??
            Environment.GetEnvironmentVariable("MAINTENANCE_MODE") ??
            Environment.GetEnvironmentVariable("MAINTENANCE_ENABLED") ??
            Environment.GetEnvironmentVariable("ENABLE_MAINTENANCE_PAGE");

        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return false;
        }

        if (bool.TryParse(rawValue, out var enabled))
        {
            return enabled;
        }

        return rawValue.Equals("1", StringComparison.OrdinalIgnoreCase) ||
               rawValue.Equals("on", StringComparison.OrdinalIgnoreCase) ||
               rawValue.Equals("yes", StringComparison.OrdinalIgnoreCase);
    }

    private static string[] BuildAllowedOrigins(IConfiguration configuration)
    {
        var configuredOrigins = new[]
        {
            configuration["Frontend:CORS_ALLOWED_ORIGINS"],
            Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS"),
            configuration["CORS_ALLOWED_ORIGINS"],
            configuration["Frontend:BaseUrl"],
            Environment.GetEnvironmentVariable("FRONTEND__BASEURL"),
            Environment.GetEnvironmentVariable("FRONTEND_BASE_URL")
        };

        var defaults = new[]
        {
            "http://localhost:5173",
            "http://localhost:5174",
            "https://localhost:5173",
            "https://localhost:5174",
            "https://crypto-inc-eood-front-end.onrender.com"
        };

        return configuredOrigins
            .Concat(defaults)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .SelectMany(value => value!
                .Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Select(value => value.Trim().TrimEnd('/'))
            .Where(value => Uri.TryCreate(value, UriKind.Absolute, out var uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static void TryRunStartupInitialization(IServiceProvider services, ILogger logger)
    {
        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var walletProvisioning = scope.ServiceProvider.GetRequiredService<WalletProvisioningService>();

            if (db.Database.IsRelational())
            {
                db.Database.Migrate();
                EnsureOptionalDemoTables(db);
            }
            else
            {
                db.Database.EnsureCreated();
            }

            var created = walletProvisioning.EnsureDefaultWalletsForAllUsers();
            if (created > 0)
            {
                db.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Startup initialization failed. The app will continue running, but database-backed features may be degraded until the issue is resolved.");
        }
    }

    private static string NormalizePostgresConnectionString(string connectionString)
    {
        if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) ||
            (uri.Scheme != "postgres" && uri.Scheme != "postgresql"))
        {
            return connectionString;
        }

        var userInfo = uri.UserInfo.Split(':', 2);
        if (userInfo.Length != 2)
        {
            throw new InvalidOperationException("PostgreSQL URL is missing credentials.");
        }

        var builder = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = Uri.UnescapeDataString(userInfo[1]),
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            SslMode = Npgsql.SslMode.Require
        };

        return builder.ConnectionString;
    }

    private static void EnsureOptionalDemoTables(AppDbContext db)
    {
        db.Database.ExecuteSqlRaw("""
            CREATE TABLE IF NOT EXISTS "BankAccounts" (
                "BankAccountId" uuid NOT NULL,
                "UserId" uuid NOT NULL,
                "AccountHolderName" text NOT NULL,
                "BankName" text NOT NULL,
                "Iban" text NOT NULL,
                "SwiftCode" text NOT NULL,
                "Currency" text NOT NULL,
                "CreatedAt" timestamp with time zone NOT NULL,
                CONSTRAINT "PK_BankAccounts" PRIMARY KEY ("BankAccountId"),
                CONSTRAINT "FK_BankAccounts_Users_UserId"
                    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
            );
            """);

        db.Database.ExecuteSqlRaw("""
            CREATE INDEX IF NOT EXISTS "IX_BankAccounts_UserId"
            ON "BankAccounts" ("UserId");
            """);
    }
    ///comentar 04.04.2026 21:39 
}
