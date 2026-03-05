using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyWebApi.Services;
using NetServer.Data;
using NetServer.DAta1;
using System.Text;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

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

        // Diagnostic: list environment variable names that contain "JWT" so we can see what's present
        try
        {
            var envNames = new System.Collections.Generic.List<string>();
            foreach (System.Collections.DictionaryEntry de in Environment.GetEnvironmentVariables())
            {
                var name = de.Key as string;
                if (!string.IsNullOrWhiteSpace(name) && name.IndexOf("JWT", StringComparison.OrdinalIgnoreCase) >= 0)
                    envNames.Add(name);
            }
            if (envNames.Count > 0)
                {
                    Console.WriteLine($"Diagnostic: environment variable names containing 'JWT': {string.Join(", ", envNames)}");
                    // Also print non-sensitive length info for each to confirm values exist
                    foreach (var n in envNames)
                    {
                        try
                        {
                            var v = Environment.GetEnvironmentVariable(n) ?? string.Empty;
                            Console.WriteLine($"Diagnostic: env '{n}' length={v.Length}");
                        }
                        catch { }
                    }
                }
            else
                Console.WriteLine("Diagnostic: no environment variable names containing 'JWT' were found.");

            var cfgPresent = !string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Key"]);
            Console.WriteLine($"Diagnostic: configuration key 'Jwt:Key' present: {cfgPresent}");
                // Also report lengths of common env var names checked explicitly
                try
                {
                    var namesToCheck = new[] { "Jwt__Key", "JWT__KEY", "JWT" };
                    foreach (var nm in namesToCheck)
                    {
                        var vv = Environment.GetEnvironmentVariable(nm) ?? string.Empty;
                        Console.WriteLine($"Diagnostic: env '{nm}' length={vv.Length}");
                    }
                }
                catch { }
        }
        catch
        {
            // swallow diagnostic errors to avoid breaking startup
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
            });

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // CORS: allow origins from configuration or environment for Render deploys
        var configuredOrigins = builder.Configuration["Frontend:AllowedOrigins"]
                               ?? Environment.GetEnvironmentVariable("FRONTEND_URLS");

        string[] allowedOrigins;
        if (!string.IsNullOrWhiteSpace(configuredOrigins))
        {
            allowedOrigins = configuredOrigins.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
        else
        {
            allowedOrigins = new[]
            {
                "http://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5173",
                "https://localhost:5174",
                "https://sudo-delete-web-service-crypto-inc-eood.onrender.com"
            };
        }

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("DevCors", policy =>
            {
                policy.WithOrigins(allowedOrigins)
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        var connectionString =
            builder.Configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DATABASE_URL");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Database connection string is missing.");

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
        builder.Services.AddScoped<WalletProvisioningService>();

        var app = builder.Build();

        // Always attempt to apply pending EF Core migrations and ensure default wallets.
        // Wrap in try/catch so the application can still start if migrations fail; errors are logged.
        try
        {
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var walletProvisioning = scope.ServiceProvider.GetRequiredService<WalletProvisioningService>();

                db.Database.Migrate();

                var created = walletProvisioning.EnsureDefaultWalletsForAllUsers();
                if (created > 0)
                    db.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Database migration or provisioning failed: {ex}");
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // app.UseHttpsRedirection();

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.UseCors("DevCors");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapFallbackToFile("index.html");

        app.Run();
    }
}