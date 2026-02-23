using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class WalletsControllerTests
{
    [Test]
    public async Task GetWallets_ReturnsUnauthorized_WhenNoUserClaim()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, null);

        var result = await controller.GetWallets(null, includeAll: false);

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task GetWallets_NonAdmin_SeesOnlyOwnWallets()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();

        db.Wallets.AddRange(
            new WalletTable { WalletID = Guid.NewGuid(), UserId = user1, Currency = "BTC", Balance = 1, Addres = "a", Status = "Active", CreatedAt = DateTime.UtcNow },
            new WalletTable { WalletID = Guid.NewGuid(), UserId = user2, Currency = "ETH", Balance = 2, Addres = "b", Status = "Active", CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, user1, isAdmin: false);

        var result = await controller.GetWallets(null, includeAll: true);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var wallets = ok!.Value as IEnumerable<WalletDto>;
        Assert.That(wallets, Is.Not.Null);
        Assert.That(wallets!.Count(), Is.EqualTo(1));
        Assert.That(wallets.Single().UserId, Is.EqualTo(user1));
    }

    [Test]
    public async Task GetWallets_AdminIncludeAll_ReturnsAllWallets()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();

        db.Wallets.AddRange(
            new WalletTable { WalletID = Guid.NewGuid(), UserId = user1, Currency = "BTC", Balance = 1, Addres = "a", Status = "Active", CreatedAt = DateTime.UtcNow },
            new WalletTable { WalletID = Guid.NewGuid(), UserId = user2, Currency = "ETH", Balance = 2, Addres = "b", Status = "Active", CreatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, user1, isAdmin: true);

        var result = await controller.GetWallets(null, includeAll: true);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var wallets = ok!.Value as IEnumerable<WalletDto>;
        Assert.That(wallets, Is.Not.Null);
        Assert.That(wallets!.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task GetWallet_ReturnsForbid_WhenNonAdminAccessesAnotherUserWallet()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerId = Guid.NewGuid();
        var callerId = Guid.NewGuid();
        var wallet = new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = ownerId,
            Currency = "BTC",
            Balance = 1,
            Addres = "x",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };
        db.Wallets.Add(wallet);
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.GetWallet(wallet.WalletID);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task CreateWallet_ReturnsForbid_WhenNonAdminTargetsDifferentUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();
        var targetId = Guid.NewGuid();
        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.CreateWallet(new CreateWalletRequest
        {
            UserId = targetId,
            Currency = "BTC",
            Balance = 0,
            Address = "a",
            Status = "Active"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task UpdateWallet_UpdatesFields_WhenOwner()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerId = Guid.NewGuid();
        var wallet = new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = ownerId,
            Currency = "BTC",
            Balance = 1,
            Addres = "x",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };
        db.Wallets.Add(wallet);
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, ownerId, isAdmin: false);

        var result = await controller.UpdateWallet(wallet.WalletID, new UpdateWalletRequest
        {
            Currency = "ETH",
            Balance = 5,
            Address = "new",
            Status = "Disabled"
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(wallet.Currency, Is.EqualTo("ETH"));
        Assert.That(wallet.Balance, Is.EqualTo(5));
        Assert.That(wallet.Addres, Is.EqualTo("new"));
        Assert.That(wallet.Status, Is.EqualTo("Disabled"));
    }

    [Test]
    public async Task DeleteWallet_ReturnsNoContent_WhenOwnerDeletesOwnWallet()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerId = Guid.NewGuid();
        var wallet = new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = ownerId,
            Currency = "BTC",
            Balance = 1,
            Addres = "x",
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };
        db.Wallets.Add(wallet);
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, ownerId, isAdmin: false);

        var result = await controller.DeleteWallet(wallet.WalletID);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.Wallets.Count(), Is.EqualTo(0));
    }
}
