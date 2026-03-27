using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class BlockchainEventsControllerTests
{
    [Test]
    public async Task GetEvents_NonAdmin_SeesOnlyEventsForOwnTransactions()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var ownTransaction = CreateTransaction(currentUserId, "BTC");
        var otherTransaction = CreateTransaction(otherUserId, "ETH");
        db.Transactions.AddRange(ownTransaction, otherTransaction);
        db.BlockchainEvents.AddRange(
            new BlockchainEvent
            {
                EventId = Guid.NewGuid(),
                ExchangeTransactionId = ownTransaction.TransactionID,
                TxHash = "own-hash",
                EventType = "Confirm",
                Status = "Done",
                Timestamp = DateTime.UtcNow
            },
            new BlockchainEvent
            {
                EventId = Guid.NewGuid(),
                ExchangeTransactionId = otherTransaction.TransactionID,
                TxHash = "other-hash",
                EventType = "Confirm",
                Status = "Done",
                Timestamp = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new BlockchainEventsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetEvents(null);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var events = ok!.Value as IEnumerable<BlockchainEventDto>;
        Assert.That(events, Is.Not.Null);
        Assert.That(events!.Count(), Is.EqualTo(1));
        Assert.That(events.Single().ExchangeTransactionId, Is.EqualTo(ownTransaction.TransactionID));
    }

    [Test]
    public async Task GetEvent_ReturnsForbid_WhenEventBelongsToAnotherUsersTransaction()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherTransaction = CreateTransaction(Guid.NewGuid(), "BTC");
        var evt = new BlockchainEvent
        {
            EventId = Guid.NewGuid(),
            ExchangeTransactionId = otherTransaction.TransactionID,
            TxHash = "other-hash",
            EventType = "Confirm",
            Status = "Done",
            Timestamp = DateTime.UtcNow
        };
        db.Transactions.Add(otherTransaction);
        db.BlockchainEvents.Add(evt);
        await db.SaveChangesAsync();

        var controller = new BlockchainEventsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetEvent(evt.EventId);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task UpdateEvent_UpdatesFields_WhenEventExists()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var transaction = CreateTransaction(Guid.NewGuid(), "BTC");
        var evt = new BlockchainEvent
        {
            EventId = Guid.NewGuid(),
            ExchangeTransactionId = transaction.TransactionID,
            TxHash = "old-hash",
            EventType = "Queued",
            Status = "Pending",
            Timestamp = DateTime.UtcNow
        };
        db.Transactions.Add(transaction);
        db.BlockchainEvents.Add(evt);
        await db.SaveChangesAsync();

        var controller = new BlockchainEventsController(db);

        var result = await controller.UpdateEvent(evt.EventId, new UpdateBlockchainEventRequest
        {
            TxHash = "new-hash",
            EventType = "Confirmed",
            Status = "Done"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(evt.TxHash, Is.EqualTo("new-hash"));
        Assert.That(evt.EventType, Is.EqualTo("Confirmed"));
        Assert.That(evt.Status, Is.EqualTo("Done"));
    }

    private static ExchangeTransaction CreateTransaction(Guid userId, string currency)
    {
        return new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = userId,
            TypeOfTransaction = "Deposit",
            Currency = currency,
            Amount = 10m,
            Status = "Completed",
            BlockchainTransactionHash = $"{currency}-hash",
            TimeStamp = DateTime.UtcNow
        };
    }
}
