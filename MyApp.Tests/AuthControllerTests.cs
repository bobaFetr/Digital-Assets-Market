using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MyWebApi.Services;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class AuthControllerTests
{
    private sealed class FakeEmailSender : IEmailSender
    {
        public Task SendAsync(string toEmail, string subject, string body)
        {
            return Task.CompletedTask;
        }
    }

    private static IConfiguration BuildConfig()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "0123456789ABCDEF0123456789ABCDEF",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience"
            })
            .Build();
    }

    [Test]
    public void Register_ReturnsBadRequest_WhenUsernameAlreadyExists_CaseInsensitive()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            UserName = "ExistingUser",
            Email = "existing@test.com",
            Password = "hashed",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));

        var result = controller.Register(new RegisterRequest
        {
            UserName = "  existinguser  ",
            Email = "new@test.com",
            Password = "Password123!"
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Username already exists."));
    }

    [Test]
    public void RegisterAdmin_ReturnsBadRequest_WhenUsernameAlreadyExists_CaseInsensitive()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            UserName = "AdminTaken",
            Email = "existing-admin@test.com",
            Password = "hashed",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));

        var result = controller.RegisterAdmin(new User
        {
            Id = Guid.NewGuid(),
            UserName = "  admintaken ",
            Email = "new-admin@test.com",
            Password = "Password123!"
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Username already exists."));
    }

    [Test]
    public void Login_ReturnsOk_AndUpgradesPasswordHash_WhenStoredPasswordIsLegacyPlainText()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        db.Users.Add(new User
        {
            Id = userId,
            UserName = "alice",
            Email = "Alice@email.com",
            Password = "bobata",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db))
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = controller.Login(new LoginRequest
        {
            Email = "Alice@email.com",
            Password = "bobata"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());

        var savedUser = db.Users.Find(userId);
        Assert.That(savedUser, Is.Not.Null);
        Assert.That(savedUser!.Password, Is.Not.EqualTo("bobata"));
        Assert.That(savedUser.Password.StartsWith("$2"), Is.True);
    }

    [Test]
    public void Login_ReturnsUnauthorized_WhenStoredPasswordIsLegacyPlainText_AndPasswordDoesNotMatch()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            UserName = "alice",
            Email = "Alice@email.com",
            Password = "bobata",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db))
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = controller.Login(new LoginRequest
        {
            Email = "Alice@email.com",
            Password = "wrong-password"
        });

        Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
    }
}
