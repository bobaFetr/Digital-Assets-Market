using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class OrderBookControllerTests
{
    [Test]
    public async Task GetOrderBook_ReturnsFilteredEntriesBySymbol()
    {
        using var db = ControllerTestHelpers.CreateDbContext();

        db.OrderBookTable.AddRange(
            new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                OrderId = Guid.NewGuid(),
                Symbol = "BTCUSDT",
                Price = 100,
                Amount = 1,
                Timestamp = DateTime.UtcNow
            },
            new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                OrderId = Guid.NewGuid(),
                Symbol = "ETHUSDT",
                Price = 200,
                Amount = 2,
                Timestamp = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new OrderBookController(db);

        var result = await controller.GetOrderBook("BTCUSDT");

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var entries = ok!.Value as IEnumerable<OrderBookDto>;
        Assert.That(entries, Is.Not.Null);
        Assert.That(entries!.Count(), Is.EqualTo(1));
        Assert.That(entries.Single().Symbol, Is.EqualTo("BTCUSDT"));
    }

    [Test]
    public async Task GetOrderBookEntry_ReturnsNotFound_WhenMissing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new OrderBookController(db);

        var result = await controller.GetOrderBookEntry(Guid.NewGuid());

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task CreateOrderBookEntry_ReturnsCreatedAtAction()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new OrderBookController(db);

        var orderId = Guid.NewGuid();
        var result = await controller.CreateOrderBookEntry(new CreateOrderBookRequest
        {
            OrderId = orderId,
            Symbol = "BTCUSDT",
            Price = 12345,
            Amount = 0.5m,
            Timestamp = DateTime.UtcNow
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);
        Assert.That(created!.ActionName, Is.EqualTo("GetOrderBookEntry"));
        Assert.That(db.OrderBookTable.Count(), Is.EqualTo(1));
    }

    [Test]
    public async Task UpdateOrderBookEntry_ReturnsNotFound_WhenMissing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new OrderBookController(db);

        var result = await controller.UpdateOrderBookEntry(Guid.NewGuid(), new UpdateOrderBookRequest
        {
            Symbol = "ETHUSDT"
        });

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task UpdateOrderBookEntry_UpdatesProvidedFields_WhenFound()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var entry = new OrderBook
        {
            OrderBookId = Guid.NewGuid(),
            OrderId = Guid.NewGuid(),
            Symbol = "BTCUSDT",
            Price = 100,
            Amount = 1,
            Timestamp = DateTime.UtcNow
        };
        db.OrderBookTable.Add(entry);
        await db.SaveChangesAsync();

        var controller = new OrderBookController(db);

        var result = await controller.UpdateOrderBookEntry(entry.OrderId, new UpdateOrderBookRequest
        {
            Symbol = "BTCUSD",
            Price = 110,
            Amount = 1.5m
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        Assert.That(entry.Symbol, Is.EqualTo("BTCUSD"));
        Assert.That(entry.Price, Is.EqualTo(110));
        Assert.That(entry.Amount, Is.EqualTo(1.5m));
    }

    [Test]
    public async Task DeleteOrderBookEntry_ReturnsNoContent_WhenFound()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var entry = new OrderBook
        {
            OrderBookId = Guid.NewGuid(),
            OrderId = Guid.NewGuid(),
            Symbol = "BTCUSDT",
            Price = 100,
            Amount = 1,
            Timestamp = DateTime.UtcNow
        };
        db.OrderBookTable.Add(entry);
        await db.SaveChangesAsync();

        var controller = new OrderBookController(db);

        var result = await controller.DeleteOrderBookEntry(entry.OrderId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.OrderBookTable.Count(), Is.EqualTo(0));
    }
}
