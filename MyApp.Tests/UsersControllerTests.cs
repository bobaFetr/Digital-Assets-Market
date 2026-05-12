using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class UsersControllerTests
{
    [Test]
    public async Task GetMe_ReturnsCurrentUser_WithDefaultProfilePicture()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        db.Users.Add(ControllerTestHelpers.CreateUser(currentUserId, "current@test.com"));
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId);

        var result = await controller.GetMe();

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var dto = ok!.Value as UserDto;
        Assert.That(dto, Is.Not.Null);
        Assert.That(dto!.Id, Is.EqualTo(currentUserId));
        Assert.That(dto.ProfilePictureUrl, Is.EqualTo("/OIP.webp"));
    }

    [Test]
    public async Task ExportMyAccountInfo_ReturnsProfileAndRelatedData()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        db.Users.Add(ControllerTestHelpers.CreateUser(currentUserId, "export@test.com"));
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = currentUserId,
            Currency = "USD",
            Balance = 42m,
            Addres = "wallet-address",
            Status = "Active",
            CreatedAt = now
        });
        db.Orders.Add(new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = currentUserId,
            TypeOfOrder = OrderType.Buy,
            Symbol = "BTCUSD",
            Price = 100m,
            Amount = 1m,
            OrderStatus = OrderStatus.Open,
            CreatedAt = now
        });
        db.Transactions.Add(new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = currentUserId,
            TypeOfTransaction = "Deposit",
            Currency = "USD",
            Amount = 42m,
            Status = "Completed",
            BlockchainTransactionHash = "tx",
            TimeStamp = now
        });
        db.Sessions.Add(new SessionTable
        {
            SessionId = Guid.NewGuid(),
            UserId = currentUserId,
            Token = "token",
            IpAddress = "127.0.0.1",
            DeviceInfo = "Chrome",
            CreatedAt = now,
            ExpiresAt = now.AddHours(1)
        });
        db.KycDocuments.Add(new KycDocument
        {
            DocId = Guid.NewGuid(),
            UserId = currentUserId,
            Type = "Passport",
            FilePath = "id.png",
            DocumentNumber = "BG123",
            FullName = "Export User",
            DateOfBirth = now.AddYears(-25),
            CountryOfResidence = "BG",
            ExpiryDate = now.AddYears(5),
            Status = "Verified",
            UploadedAt = now
        });
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId);

        var result = await controller.ExportMyAccountInfo();

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(ok!.Value, Is.Not.Null);
        Assert.That(ok.Value!.GetType().GetProperty("profile"), Is.Not.Null);
        Assert.That(ok.Value.GetType().GetProperty("wallets"), Is.Not.Null);
        Assert.That(ok.Value.GetType().GetProperty("orders"), Is.Not.Null);
        Assert.That(ok.Value.GetType().GetProperty("transactions"), Is.Not.Null);
        Assert.That(ok.Value.GetType().GetProperty("sessions"), Is.Not.Null);
        Assert.That(ok.Value.GetType().GetProperty("kycDocuments"), Is.Not.Null);
    }

    [Test]
    public async Task UpdateMyUserName_ReturnsBadRequest_WhenUsernameTakenByAnotherUser_CaseInsensitive()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();
        var otherId = Guid.NewGuid();

        db.Users.AddRange(
            new User
            {
                Id = callerId,
                UserName = "Caller",
                Email = "caller@test.com",
                Password = "hashed",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                Status = User.StatusBit.Active,
                IsBanned = false
            },
            new User
            {
                Id = otherId,
                UserName = "TakenName",
                Email = "taken@test.com",
                Password = "hashed",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                Status = User.StatusBit.Active,
                IsBanned = false
            });
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.UpdateMyUserName(new UpdateUserNameRequest
        {
            UserName = "  takenname  "
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Username already exists."));
    }

    [Test]
    public async Task UpdateMyProfilePicture_SavesValidatedUrl()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();
        db.Users.Add(ControllerTestHelpers.CreateUser(callerId, "caller@test.com"));
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, callerId);

        var result = await controller.UpdateMyProfilePicture(new UpdateProfilePictureRequest
        {
            ProfilePictureUrl = "  https://example.com/avatar.png  "
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var saved = await db.Users.FindAsync(callerId);
        Assert.That(saved!.ProfilePictureUrl, Is.EqualTo("https://example.com/avatar.png"));
    }

    [Test]
    public async Task UpdateMyUserName_AllowsSameUsernameForCurrentUser_WithDifferentCasing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();

        db.Users.Add(new User
        {
            Id = callerId,
            UserName = "MyName",
            Email = "caller@test.com",
            Password = "hashed",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.UpdateMyUserName(new UpdateUserNameRequest
        {
            UserName = "  myname  "
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var saved = await db.Users.FindAsync(callerId);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved!.UserName, Is.EqualTo("myname"));
    }

    [Test]
    public async Task GetAll_FiltersBannedUsers_AndIncludesLatestSession()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var activeId = Guid.NewGuid();
        var bannedId = Guid.NewGuid();
        var banned = ControllerTestHelpers.CreateUser(bannedId, "banned@test.com");
        banned.IsBanned = true;
        db.Users.AddRange(ControllerTestHelpers.CreateUser(activeId, "active@test.com"), banned);
        db.Sessions.AddRange(
            new SessionTable
            {
                SessionId = Guid.NewGuid(),
                UserId = bannedId,
                Token = "old",
                IpAddress = "10.0.0.1",
                DeviceInfo = "Old Device",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            },
            new SessionTable
            {
                SessionId = Guid.NewGuid(),
                UserId = bannedId,
                Token = "new",
                IpAddress = "10.0.0.2",
                DeviceInfo = "New Device",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            });
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid(), isAdmin: true);

        var result = await controller.GetAll("banned");

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var users = ok!.Value as List<UserDto>;
        Assert.That(users, Is.Not.Null);
        Assert.That(users, Has.Count.EqualTo(1));
        Assert.That(users![0].Id, Is.EqualTo(bannedId));
        Assert.That(users[0].LastDeviceInfo, Is.EqualTo("New Device"));
        Assert.That(users[0].LastIpAddress, Is.EqualTo("10.0.0.2"));
    }

    [Test]
    public async Task BanAndUnbanUser_FindByEmail_UpdatesBannedState()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        db.Users.Add(ControllerTestHelpers.CreateUser(userId, "target@test.com"));
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid(), isAdmin: true);

        var banResult = await controller.BanUser(new UserBanRequest { Email = " TARGET@test.com " });

        Assert.That(banResult, Is.InstanceOf<OkObjectResult>());
        Assert.That((await db.Users.FindAsync(userId))!.IsBanned, Is.True);

        var unbanResult = await controller.UnbanUser(new UserBanRequest { Id = userId });

        Assert.That(unbanResult, Is.InstanceOf<OkObjectResult>());
        Assert.That((await db.Users.FindAsync(userId))!.IsBanned, Is.False);
    }
}
