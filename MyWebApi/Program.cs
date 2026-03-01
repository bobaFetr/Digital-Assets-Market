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

        var jwtKey = builder.Configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is missing.");

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

        if (app.Environment.IsDevelopment())
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var walletProvisioning = scope.ServiceProvider.GetRequiredService<WalletProvisioningService>();

            db.Database.Migrate();

            var created = walletProvisioning.EnsureDefaultWalletsForAllUsers();
            if (created > 0)
                db.SaveChanges();

            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

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