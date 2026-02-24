using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class OrdersControllerTests
{
    [Test]
    public async Task CreateOrder_MarketOrder_ReturnsBadRequest_WhenNotEnoughLiquidity()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var sellerId = Guid.NewGuid();
        var buyerId = Guid.NewGuid();

        var sellOrder = new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = sellerId,
            TypeOfOrder = OrderType.Sell,
            Symbol = "ALGOUSD",
            Price = 0.09m,
            Amount = 5m,
            OrderStatus = OrderStatus.Open,
            CreatedAt = DateTime.UtcNow
        };
        db.Orders.Add(sellOrder);
        db.OrderBookTable.Add(new OrderBook
        {
            OrderBookId = Guid.NewGuid(),
            OrderId = sellOrder.OrderId,
            Symbol = sellOrder.Symbol,
            Price = sellOrder.Price,
            Amount = 5m,
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new OrdersController(db);
        ControllerTestHelpers.SetUser(controller, buyerId, isAdmin: false);

        var result = await controller.CreateOrder(new CreateOrderRequest
        {
            TypeOfOrder = OrderType.Buy,
            OrderKind = "Market",
            Symbol = "ALGOUSD",
            Amount = 6m,
            Price = 0m
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Not enough liquidity available for market order."));
    }

    [Test]
    public async Task CreateOrder_LimitOrder_PartiallyFills_AndLeavesRemainderOpenInOrderBook()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var sellerId = Guid.NewGuid();
        var buyerId = Guid.NewGuid();

        var sellOrder = new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = sellerId,
            TypeOfOrder = OrderType.Sell,
            Symbol = "ALGOUSD",
            Price = 0.09m,
            Amount = 5m,
            OrderStatus = OrderStatus.Open,
            CreatedAt = DateTime.UtcNow
        };
        db.Orders.Add(sellOrder);
        db.OrderBookTable.Add(new OrderBook
        {
            OrderBookId = Guid.NewGuid(),
            OrderId = sellOrder.OrderId,
            Symbol = sellOrder.Symbol,
            Price = sellOrder.Price,
            Amount = 5m,
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new OrdersController(db);
        ControllerTestHelpers.SetUser(controller, buyerId, isAdmin: false);

        var result = await controller.CreateOrder(new CreateOrderRequest
        {
            TypeOfOrder = OrderType.Buy,
            OrderKind = "Limit",
            Symbol = "ALGOUSD",
            Price = 0.09m,
            Amount = 8m
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var createdOrder = created!.Value as OrderDto;
        Assert.That(createdOrder, Is.Not.Null);

        var reloadedSell = await db.Orders.FindAsync(sellOrder.OrderId);
        Assert.That(reloadedSell, Is.Not.Null);
        Assert.That(reloadedSell!.OrderStatus, Is.EqualTo(OrderStatus.Filled));

        var reloadedBuy = await db.Orders.FindAsync(createdOrder!.OrderId);
        Assert.That(reloadedBuy, Is.Not.Null);
        Assert.That(reloadedBuy!.OrderStatus, Is.EqualTo(OrderStatus.Open));
        Assert.That(reloadedBuy.Amount, Is.EqualTo(3m));

        Assert.That(db.TradesTable.Count(), Is.EqualTo(1));
        var trade = db.TradesTable.Single();
        Assert.That(trade.Price, Is.EqualTo(0.09m));
        Assert.That(trade.Amount, Is.EqualTo(5d));

        var openOrderBookRows = db.OrderBookTable.Where(ob => ob.Symbol == "ALGOUSD").ToList();
        Assert.That(openOrderBookRows.Count, Is.EqualTo(1));
        Assert.That(openOrderBookRows[0].OrderId, Is.EqualTo(createdOrder.OrderId));
        Assert.That(openOrderBookRows[0].Amount, Is.EqualTo(3m));
    }
}
