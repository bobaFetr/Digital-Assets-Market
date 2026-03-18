using MyWebApi.Services;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class WalletProvisioningServiceTests
{
    [Test]
    public void EnsureDefaultWalletsForUser_DoesNothing_WhenUserAlreadyHasWallets()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();

        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = userId,
            Currency = "EUR",
            Balance = 0m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();

        var service = new WalletProvisioningService(db);

        var created = service.EnsureDefaultWalletsForUser(userId);

        Assert.That(created, Is.EqualTo(0));
        Assert.That(db.Wallets.Where(w => w.UserId == userId).Select(w => w.Currency).ToList(), Is.EqualTo(new[] { "EUR" }));
    }

    [Test]
    public void EnsureDefaultWalletsForUser_WithExplicitEuroOnly_CreatesOnlyEuro()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var service = new WalletProvisioningService(db);

        var created = service.EnsureDefaultWalletsForUser(userId, new[] { "EUR" }, null);

        Assert.That(created, Is.EqualTo(1));
        var currencies = db.Wallets.Where(w => w.UserId == userId).Select(w => w.Currency).OrderBy(c => c).ToList();
        Assert.That(currencies, Is.EqualTo(new[] { "EUR" }));
    }

    [Test]
    public void EnsureDefaultWalletsForUser_WithExplicitUsdOnly_CreatesOnlyUsd()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var service = new WalletProvisioningService(db);

        var created = service.EnsureDefaultWalletsForUser(userId, new[] { "USD" }, null);

        Assert.That(created, Is.EqualTo(1));
        var currencies = db.Wallets.Where(w => w.UserId == userId).Select(w => w.Currency).OrderBy(c => c).ToList();
        Assert.That(currencies, Is.EqualTo(new[] { "USD" }));
    }

    [Test]
    public void EnsureDefaultWalletsForUser_WithExplicitUsdAndEuro_CreatesBoth()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        var service = new WalletProvisioningService(db);

        var created = service.EnsureDefaultWalletsForUser(userId, new[] { "USD", "EUR" }, null);

        Assert.That(created, Is.EqualTo(2));
        var currencies = db.Wallets.Where(w => w.UserId == userId).Select(w => w.Currency).OrderBy(c => c).ToList();
        Assert.That(currencies, Is.EqualTo(new[] { "EUR", "USD" }));
    }
}
