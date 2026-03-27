using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class TradesControllerTests
{
    [Test]
    public async Task GetTrades_NonAdminWithoutFilters_SeesOnlyTradesForOwnOrders()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        var ownBuyOrder = CreateOrder(currentUserId, "BTCUSD");
        var otherBuyOrder = CreateOrder(otherUserId, "ETHUSD");
        db.Orders.AddRange(ownBuyOrder, otherBuyOrder);

        db.TradesTable.AddRange(
            new TradesTable
            {
                TradeId = Guid.NewGuid(),
                BuyOrderId = ownBuyOrder.OrderId,
                SellOrderId = null,
                Price = 60000m,
                Amount = 0.5,
                TimeStamp = DateTime.UtcNow
            },
            new TradesTable
            {
                TradeId = Guid.NewGuid(),
                BuyOrderId = otherBuyOrder.OrderId,
                SellOrderId = null,
                Price = 3000m,
                Amount = 1.2,
                TimeStamp = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new TradesController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetTrades(null, null);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var trades = ok!.Value as IEnumerable<TradeDto>;
        Assert.That(trades, Is.Not.Null);
        Assert.That(trades!.Count(), Is.EqualTo(1));
        Assert.That(trades.Single().BuyOrderId, Is.EqualTo(ownBuyOrder.OrderId));
    }

    [Test]
    public async Task GetTrade_ReturnsForbid_WhenTradeDoesNotBelongToCurrentUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var order = CreateOrder(otherUserId, "BTCUSD");
        var trade = new TradesTable
        {
            TradeId = Guid.NewGuid(),
            BuyOrderId = order.OrderId,
            SellOrderId = null,
            Price = 60000m,
            Amount = 0.5,
            TimeStamp = DateTime.UtcNow
        };

        db.Orders.Add(order);
        db.TradesTable.Add(trade);
        await db.SaveChangesAsync();

        var controller = new TradesController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetTrade(trade.TradeId);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task CreateTrade_CreatesTrade_WithProvidedValues()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var buyOrder = CreateOrder(Guid.NewGuid(), "BTCUSD");
        var sellOrder = CreateOrder(Guid.NewGuid(), "BTCUSD", OrderType.Sell);
        db.Orders.AddRange(buyOrder, sellOrder);
        await db.SaveChangesAsync();

        var controller = new TradesController(db);
        var timestamp = DateTime.UtcNow.AddMinutes(-5);

        var result = await controller.CreateTrade(new CreateTradeRequest
        {
            BuyOrderId = buyOrder.OrderId,
            SellOrderId = sellOrder.OrderId,
            Price = 62000m,
            Amount = 0.75,
            TimeStamp = timestamp
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var saved = db.TradesTable.Single();
        Assert.That(saved.BuyOrderId, Is.EqualTo(buyOrder.OrderId));
        Assert.That(saved.SellOrderId, Is.EqualTo(sellOrder.OrderId));
        Assert.That(saved.Price, Is.EqualTo(62000m));
        Assert.That(saved.Amount, Is.EqualTo(0.75));
        Assert.That(saved.TimeStamp, Is.EqualTo(timestamp));
    }

    [Test]
    public async Task DeleteTrade_ReturnsNoContent_WhenTradeExists()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var buyOrder = CreateOrder(Guid.NewGuid(), "BTCUSD");
        var trade = new TradesTable
        {
            TradeId = Guid.NewGuid(),
            BuyOrderId = buyOrder.OrderId,
            SellOrderId = null,
            Price = 60000m,
            Amount = 0.5,
            TimeStamp = DateTime.UtcNow
        };
        db.Orders.Add(buyOrder);
        db.TradesTable.Add(trade);
        await db.SaveChangesAsync();

        var controller = new TradesController(db);

        var result = await controller.DeleteTrade(trade.TradeId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.TradesTable, Is.Empty);
    }

    private static OrdersTable CreateOrder(Guid userId, string symbol, OrderType orderType = OrderType.Buy)
    {
        return new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = userId,
            Symbol = symbol,
            TypeOfOrder = orderType,
            Price = 1m,
            Amount = 1m,
            OrderStatus = OrderStatus.Open,
            CreatedAt = DateTime.UtcNow
        };
    }
}
