// using Microsoft.EntityFrameworkCore;
// using NetServer.Data;
using Microsoft.AspNetCore;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Services;
using NetServer.Data;

//using NetServer.Data;
using NetServer.DAta1;
internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        
        // JWT Authentication
        var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(jwtKey))
            };
        });

        builder.Services.AddControllers();
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("DevCors", policy =>
            {
                policy.WithOrigins(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "https://localhost:5173",
                        "https://localhost:5174")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
        builder.Services.AddScoped<WalletProvisioningService>();
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        var app = builder.Build();

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var walletProvisioning = scope.ServiceProvider.GetRequiredService<WalletProvisioningService>();
            // Ensure database is up-to-date with migrations on startup
            try
            {
                db.Database.Migrate();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database migration failed: {ex.Message}");
                throw;
            }

            var created = walletProvisioning.EnsureDefaultWalletsForAllUsers();
            if (created > 0)
            {
                db.SaveChanges();
            }
        }

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        /////
        app.UseDefaultFiles();   // serves index.html automatically
        app.UseStaticFiles();    // enables wwwroot
        /////
        app.UseCors("DevCors");

        app.UseAuthentication(); // Add this
        app.UseAuthorization(); // Add this
        app.MapControllers(); // Add this
        ///
        app.MapFallbackToFile("index.html");
        ////
        app.Run();
    }
    ////////
    /// ///
    /// ///
    /// ///
    /// ///
    /// //
}