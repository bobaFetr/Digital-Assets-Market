using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

namespace MyApp.Tests;

internal static class ControllerTestHelpers
{
    public static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new AppDbContext(options);
    }

    public static void SetUser(ControllerBase controller, Guid? userId, bool isAdmin = false)
    {
        var claims = new List<Claim>();

        if (userId.HasValue)
        {
            claims.Add(new Claim(ClaimTypes.NameIdentifier, userId.Value.ToString()));
        }

        if (isAdmin)
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }

        var identity = new ClaimsIdentity(claims, "TestAuth", ClaimTypes.Name, ClaimTypes.Role);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }

    public static User CreateUser(Guid id, string email, string role = "User")
    {
        return new User
        {
            Id = id,
            UserName = email.Split('@')[0],
            Email = email,
            Password = "hashed",
            Role = role,
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        };
    }
}
