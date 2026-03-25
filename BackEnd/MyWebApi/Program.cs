using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyWebApi.Services;
using NetServer.Data;
using NetServer.DAta1;
using System.Security.Claims;
using System.Text;
using Microsoft.Net.Http.Headers;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var maintenanceModeEnabled = IsMaintenanceModeEnabled(builder.Configuration);

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
            throw new InvalidOperationException("Jwt:Key is missing. Set environment variable 'Jwt__Key' or configuration 'Jwt:Key'.");

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey))
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var userIdValue = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                        if (!Guid.TryParse(userIdValue, out var userId))
                        {
                            context.Fail("Invalid token.");
                            return;
                        }

                        await using var scope = context.HttpContext.RequestServices.CreateAsyncScope();
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        var user = await db.Users
                            .AsNoTracking()
                            .Where(u => u.Id == userId)
                            .Select(u => new { u.IsBanned })
                            .FirstOrDefaultAsync();

                        if (user == null)
                        {
                            context.Fail("User not found.");
                            return;
                        }

                        if (user.IsBanned)
                        {
                            context.Fail("User is banned");
                        }
                    },
                    OnChallenge = async context =>
                    {
                        if (!string.Equals(context.AuthenticateFailure?.Message, "User is banned", StringComparison.Ordinal))
                        {
                            return;
                        }

                        context.HandleResponse();
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync("{\"message\":\"User is banned\"}");
                    }
                };
            });

        builder.Services.AddControllers();

        builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
        {
            options.SuppressModelStateInvalidFilter = true;
        });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // CORS
        var configuredOrigins = builder.Configuration["Frontend:CORS_ALLOWED_ORIGINS"]
                               ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");

        string[] allowedOrigins = !string.IsNullOrWhiteSpace(configuredOrigins)
            ? configuredOrigins.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            : new[]
            {
                "http://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5173",
                "https://localhost:5174",
                "https://crypto-inc-eood-front-end.onrender.com"
            };

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("FrontendCors", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
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
            throw new InvalidOperationException("Database connection string is missing.");
        }

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
        builder.Services.AddScoped<WalletProvisioningService>();

        var app = builder.Build();
        var maintenancePagePath = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "maintenance.html");

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var walletProvisioning = scope.ServiceProvider.GetRequiredService<WalletProvisioningService>();

            

            var created = walletProvisioning.EnsureDefaultWalletsForAllUsers();
            if (created > 0)
                db.SaveChanges();
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

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

        app.UseCors("FrontendCors");

        app.UseAuthentication();
        app.UseAuthorization();

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
}
