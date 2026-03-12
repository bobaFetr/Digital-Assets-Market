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

        builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
        {
            options.SuppressModelStateInvalidFilter = true;
        });

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // CORS
        var configuredOrigins = builder.Configuration["Frontend:AllowedOrigins"]
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

        try
        {
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var walletProvisioning = scope.ServiceProvider.GetRequiredService<WalletProvisioningService>();

                // db.Database.Migrate();

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

        app.UseCors("FrontendCors");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapFallbackToFile("index.html");

        app.Run();
    }
}