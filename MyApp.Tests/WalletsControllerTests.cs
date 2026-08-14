using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class WalletsControllerTests
{
    [SetUp]
    public void EnableExplicitDemoDepositModeForLegacyDepositTests() =>
        Environment.SetEnvironmentVariable("ENABLE_SIMULATED_CARD_DEPOSITS", "true");

    [TearDown]
    public void DisableExplicitDemoDepositMode() =>
        Environment.SetEnvironmentVariable("ENABLE_SIMULATED_CARD_DEPOSITS", null);

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

    [Test]
    public async Task AddMoneyFromCard_CreditsWallet_AndCreatesTransaction()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = userId,
            Currency = "USD",
            Balance = 10m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = await controller.AddMoneyFromCard(new AddMoneyByCardRequest
        {
            CardNumber = "4111111111111111",
            CardHolderName = "Alice Test",
            Cvv = "123",
            ExpiryDate = "12/99",
            Amount = 25m,
            Currency = "USD"
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var wallet = db.Wallets.Single(w => w.UserId == userId && w.Currency == "USD");
        Assert.That(wallet.Balance, Is.EqualTo(35m));

        var tx = db.Transactions.Single(t => t.UserID == userId);
        Assert.That(tx.TypeOfTransaction, Is.EqualTo("CardDeposit"));
        Assert.That(tx.Currency, Is.EqualTo("USD"));
        Assert.That(tx.Amount, Is.EqualTo(25m));
        Assert.That(tx.Status, Is.EqualTo("Completed"));

        var savedCard = db.CreditCardDetails.Single(c => c.UserId == userId);
        Assert.That(savedCard.CardHolderName, Is.EqualTo("Alice Test"));
        Assert.That(savedCard.CardLast4, Is.EqualTo("1111"));
    }

    [Test]
    public async Task AddMoneyFromCard_UsesSavedCard_WhenOnlyAmountProvided()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();

        db.CreditCardDetails.Add(new CreditCardDetailsTable
        {
            UserId = userId,
            CardHolderName = "Saved Holder",
            CardLast4 = "1234",
            ExpiryDate = "12/99",
            Currency = "USD",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = await controller.AddMoneyFromCard(new AddMoneyByCardRequest
        {
            Amount = 40m,
            Currency = "USD"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());

        var wallet = db.Wallets.Single(w => w.UserId == userId && w.Currency == "USD");
        Assert.That(wallet.Balance, Is.EqualTo(40m));
    }

    [Test]
    public async Task AddMoneyFromCard_UsesSavedCard_AndCreditsSelectedFiatCurrency()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();

        db.CreditCardDetails.Add(new CreditCardDetailsTable
        {
            UserId = userId,
            CardHolderName = "Saved Holder",
            CardLast4 = "1234",
            ExpiryDate = "12/99",
            Currency = "USD",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = await controller.AddMoneyFromCard(new AddMoneyByCardRequest
        {
            Amount = 40m,
            Currency = "EUR"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());

        var wallet = db.Wallets.Single(w => w.UserId == userId && w.Currency == "EUR");
        Assert.That(wallet.Balance, Is.EqualTo(40m));

        var tx = db.Transactions.Single(t => t.UserID == userId);
        Assert.That(tx.Currency, Is.EqualTo("EUR"));
    }

    [Test]
    public async Task GetSavedCardDetails_ReturnsSavedCard_ForCurrentUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();

        db.CreditCardDetails.Add(new CreditCardDetailsTable
        {
            UserId = userId,
            CardHolderName = "Alice",
            CardLast4 = "4321",
            ExpiryDate = "10/99",
            Currency = "EUR",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = await controller.GetSavedCardDetails();

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var dto = ok!.Value as CreditCardDetailsDto;
        Assert.That(dto, Is.Not.Null);
        Assert.That(dto!.CreditCardId, Is.EqualTo(userId));
        Assert.That(dto.CardLast4, Is.EqualTo("4321"));
    }

    [Test]
    public async Task AddMoneyFromCard_ReturnsBadRequest_WhenCvvInvalid()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var userId = Guid.NewGuid();

        var controller = new WalletsController(db);
        ControllerTestHelpers.SetUser(controller, userId, isAdmin: false);

        var result = await controller.AddMoneyFromCard(new AddMoneyByCardRequest
        {
            CardNumber = "4111111111111111",
            CardHolderName = "Alice Test",
            Cvv = "1",
            ExpiryDate = "12/99",
            Amount = 25m,
            Currency = "USD"
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("CVV is invalid."));
    }
}
