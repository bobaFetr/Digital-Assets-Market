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
    public void Register_ReturnsBadRequest_WhenIdentityVerificationDataMissing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));

        var result = controller.Register(new RegisterRequest
        {
            UserName = "newuser",
            Email = "new@test.com",
            Password = "Password123!"
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("ID verification fields are required during registration."));
    }

    [Test]
    public void Register_CreatesKycDocument_WhenIdentityVerificationDataProvided()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));

        var result = controller.Register(new RegisterRequest
        {
            UserName = "verifieduser",
            Email = "verified@test.com",
            Password = "Password123!",
            FullName = "Verified User",
            IdNumber = "ID-778899",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            ExpiryDate = DateTime.UtcNow.AddYears(3),
            Country = "BG",
            DocumentType = "Passport",
            IdFilePath = "id.png"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());

        var createdUser = db.Users.SingleOrDefault(u => u.Email == "verified@test.com");
        Assert.That(createdUser, Is.Not.Null);

        var kyc = db.KycDocuments.SingleOrDefault(k => k.UserId == createdUser!.Id);
        Assert.That(kyc, Is.Not.Null);
        Assert.That(kyc!.DocumentNumber, Is.EqualTo("ID-778899"));
        Assert.That(kyc.Status, Is.EqualTo("Verified"));
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

    [Test]
    public void DeleteAccount_ReturnsBadRequest_WhenUserHasRemainingWalletBalance()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        db.Users.Add(new User
        {
            Id = userId,
            UserName = "alice",
            Email = "alice@test.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = userId,
            Currency = "USD",
            Balance = 50m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = controller.DeleteAccount(new DeleteAccountRequest
        {
            CurrentPassword = "Password123!"
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Bank account details are required before deleting your profile."));

        var savedUser = db.Users.Find(userId);
        Assert.That(savedUser, Is.Not.Null);
        Assert.That(savedUser!.Role, Is.EqualTo("User"));
        Assert.That(savedUser.IsBanned, Is.False);
    }

    [Test]
    public void DeleteAccount_ReturnsOk_WhenBalanceExistsAndBankDetailsProvided()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        db.Users.Add(new User
        {
            Id = userId,
            UserName = "alice",
            Email = "alice@test.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = userId,
            Currency = "USD",
            Balance = 50m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = controller.DeleteAccount(new DeleteAccountRequest
        {
            CurrentPassword = "Password123!",
            BankAccountHolderName = "Alice Test",
            BankName = "Demo Bank",
            Iban = "BG80BNBG96611020345678",
            SwiftCode = "BNBGBGSD"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());

        var savedWallet = db.Wallets.Single(w => w.UserId == userId && w.Currency == "USD");
        Assert.That(savedWallet.Balance, Is.EqualTo(0m));

        var transferTx = db.Transactions.Single(t => t.UserID == userId && t.TypeOfTransaction == "BankTransferOut");
        Assert.That(transferTx.Amount, Is.EqualTo(50m));

        var savedUser = db.Users.Find(userId);
        Assert.That(savedUser, Is.Not.Null);
        Assert.That(savedUser!.Role, Is.EqualTo("DeletedUser"));
        Assert.That(savedUser.IsBanned, Is.True);
    }

    [Test]
    public void DeleteAccount_ReturnsOk_WhenWalletBalanceIsZero()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        db.Users.Add(new User
        {
            Id = userId,
            UserName = "alice",
            Email = "alice@test.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = userId,
            Currency = "USD",
            Balance = 0m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();

        var controller = new AuthController(db, BuildConfig(), new FakeEmailSender(), new WalletProvisioningService(db));
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = controller.DeleteAccount(new DeleteAccountRequest
        {
            CurrentPassword = "Password123!"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());

        var savedUser = db.Users.Find(userId);
        Assert.That(savedUser, Is.Not.Null);
        Assert.That(savedUser!.Role, Is.EqualTo("DeletedUser"));
        Assert.That(savedUser.IsBanned, Is.True);
    }
}
