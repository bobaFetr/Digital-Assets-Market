using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class TransactionsControllerTests
{
    [Test]
    public async Task GetTransactions_ReturnsUnauthorized_WhenNoUserClaim()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new TransactionsController(db);
        ControllerTestHelpers.SetUser(controller, null);

        var result = await controller.GetTransactions(null);

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task GetTransactions_NonAdmin_SeesOnlyOwnTransactions()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();

        db.Transactions.AddRange(
            new ExchangeTransaction { TransactionID = Guid.NewGuid(), UserID = user1, TypeOfTransaction = "Buy", Currency = "BTC", Amount = 1, Status = "Done", BlockchainTransactionHash = "h1", TimeStamp = DateTime.UtcNow },
            new ExchangeTransaction { TransactionID = Guid.NewGuid(), UserID = user2, TypeOfTransaction = "Sell", Currency = "ETH", Amount = 2, Status = "Done", BlockchainTransactionHash = "h2", TimeStamp = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var controller = new TransactionsController(db);
        ControllerTestHelpers.SetUser(controller, user1, isAdmin: false);

        var result = await controller.GetTransactions(null);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var items = ok!.Value as IEnumerable<ExchangeTransactionDto>;
        Assert.That(items, Is.Not.Null);
        Assert.That(items!.Count(), Is.EqualTo(1));
        Assert.That(items.Single().UserId, Is.EqualTo(user1));
    }

    [Test]
    public async Task GetTransaction_ReturnsForbid_WhenNonOwnerRequestsAnotherUsersTransaction()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerId = Guid.NewGuid();
        var callerId = Guid.NewGuid();
        var tx = new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = ownerId,
            TypeOfTransaction = "Buy",
            Currency = "BTC",
            Amount = 1,
            Status = "Done",
            BlockchainTransactionHash = "hash",
            TimeStamp = DateTime.UtcNow
        };
        db.Transactions.Add(tx);
        await db.SaveChangesAsync();

        var controller = new TransactionsController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.GetTransaction(tx.TransactionID);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task CreateTransaction_ReturnsForbid_WhenNonAdminCreatesForOtherUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();
        var targetId = Guid.NewGuid();
        var controller = new TransactionsController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.CreateTransaction(new CreateExchangeTransactionRequest
        {
            UserId = targetId,
            TypeOfTransaction = "Buy",
            Currency = "BTC",
            Amount = 1,
            Status = "Pending",
            BlockchainTransactionHash = "hash"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task UpdateTransaction_UpdatesFields_WhenOwner()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerId = Guid.NewGuid();
        var tx = new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = ownerId,
            TypeOfTransaction = "Buy",
            Currency = "BTC",
            Amount = 1,
            Status = "Pending",
            BlockchainTransactionHash = "old",
            TimeStamp = DateTime.UtcNow
        };
        db.Transactions.Add(tx);
        await db.SaveChangesAsync();

        var controller = new TransactionsController(db);
        ControllerTestHelpers.SetUser(controller, ownerId, isAdmin: false);

        var result = await controller.UpdateTransaction(tx.TransactionID, new UpdateExchangeTransactionRequest
        {
            Amount = 5,
            Status = "Done",
            BlockchainTransactionHash = "new"
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(tx.Amount, Is.EqualTo(5));
        Assert.That(tx.Status, Is.EqualTo("Done"));
        Assert.That(tx.BlockchainTransactionHash, Is.EqualTo("new"));
    }

    [Test]
    public async Task DeleteTransaction_ReturnsNoContent_WhenOwnerDeletesOwnTransaction()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerId = Guid.NewGuid();
        var tx = new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = ownerId,
            TypeOfTransaction = "Buy",
            Currency = "BTC",
            Amount = 1,
            Status = "Pending",
            BlockchainTransactionHash = "old",
            TimeStamp = DateTime.UtcNow
        };
        db.Transactions.Add(tx);
        await db.SaveChangesAsync();

        var controller = new TransactionsController(db);
        ControllerTestHelpers.SetUser(controller, ownerId, isAdmin: false);

        var result = await controller.DeleteTransaction(tx.TransactionID);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.Transactions.Count(), Is.EqualTo(0));
    }
}
