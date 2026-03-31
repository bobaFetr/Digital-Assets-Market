using Microsoft.AspNetCore.Mvc;
using MyWebApi.Services;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class OrdersControllerTests
{
    private sealed class FakeMarketDataService : IMarketDataService
    {
        public MarketTickerDto? Ticker { get; set; }
        public MarketDepthDto? Depth { get; set; }

        public bool TryMapSymbol(string appSymbol, out string marketSymbol)
        {
            marketSymbol = appSymbol.ToUpperInvariant() switch
            {
                "ALGOUSD" => "ALGOUSDT",
                "BTCUSD" => "BTCUSDT",
                _ => string.Empty
            };

            return !string.IsNullOrWhiteSpace(marketSymbol);
        }

        public IReadOnlyCollection<string> GetSupportedSymbols()
        {
            return new[] { "ALGOUSD", "BTCUSD" };
        }

        public Task<MarketTickerDto?> GetTickerAsync(string appSymbol, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Ticker);
        }

        public Task<MarketDepthDto?> GetDepthAsync(string appSymbol, int limit = 20, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Depth);
        }

        public Task<IReadOnlyList<MarketCandleDto>> GetKlinesAsync(string appSymbol, string interval = "1m", int limit = 120, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyList<MarketCandleDto>>(Array.Empty<MarketCandleDto>());
        }
    }

    [Test]
    public async Task CreateOrder_MarketOrder_ReturnsBadRequest_WhenNotEnoughMarketLiquidity()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var buyerId = Guid.NewGuid();
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = buyerId,
            Currency = "USD",
            Balance = 100m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var marketData = new FakeMarketDataService
        {
            Depth = new MarketDepthDto
            {
                Symbol = "ALGOUSD",
                MarketSymbol = "ALGOUSDT",
                AsOfUtc = DateTime.UtcNow,
                Asks =
                {
                    new MarketDepthLevelDto { Price = 0.10m, Quantity = 5m }
                }
            }
        };

        var controller = new OrdersController(
            db,
            new PaperTradingService(db, marketData, ControllerTestHelpers.CreateLogger<PaperTradingService>()));
        ControllerTestHelpers.SetUser(controller, buyerId, isAdmin: false);

        var result = await controller.CreateOrder(new CreateOrderRequest
        {
            TypeOfOrder = OrderType.Buy,
            OrderKind = "Market",
            Symbol = "ALGOUSD",
            Amount = 6m
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Not enough market liquidity available."));
    }

    [Test]
    public async Task CreateOrder_MarketBuy_FillsAgainstExternalDepth_AndUpdatesWallets()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var buyerId = Guid.NewGuid();
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = buyerId,
            Currency = "USD",
            Balance = 100m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var marketData = new FakeMarketDataService
        {
            Depth = new MarketDepthDto
            {
                Symbol = "ALGOUSD",
                MarketSymbol = "ALGOUSDT",
                AsOfUtc = DateTime.UtcNow,
                Asks =
                {
                    new MarketDepthLevelDto { Price = 0.10m, Quantity = 3m },
                    new MarketDepthLevelDto { Price = 0.12m, Quantity = 3m }
                },
                Bids =
                {
                    new MarketDepthLevelDto { Price = 0.09m, Quantity = 2m }
                }
            }
        };

        var controller = new OrdersController(
            db,
            new PaperTradingService(db, marketData, ControllerTestHelpers.CreateLogger<PaperTradingService>()));
        ControllerTestHelpers.SetUser(controller, buyerId, isAdmin: false);

        var result = await controller.CreateOrder(new CreateOrderRequest
        {
            TypeOfOrder = OrderType.Buy,
            OrderKind = "Market",
            Symbol = "ALGOUSD",
            Amount = 5m
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var order = db.Orders.Single();
        Assert.That(order.OrderStatus, Is.EqualTo(OrderStatus.Filled));
        Assert.That(order.Amount, Is.EqualTo(5m));

        var buyerAlgoWallet = db.Wallets.Single(w => w.UserId == buyerId && w.Currency == "ALGO");
        Assert.That(buyerAlgoWallet.Balance, Is.EqualTo(5m));

        var buyerUsdWallet = db.Wallets.Single(w => w.UserId == buyerId && w.Currency == "USD");
        Assert.That(buyerUsdWallet.Balance, Is.EqualTo(100m - (3m * 0.10m) - (2m * 0.12m)));

        Assert.That(db.TradesTable.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task CreateOrder_LimitBuy_CreatesOpenPaperOrder_WhenMarketHasNotReachedLimit()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var buyerId = Guid.NewGuid();
        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = buyerId,
            Currency = "USD",
            Balance = 20m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var marketData = new FakeMarketDataService
        {
            Depth = new MarketDepthDto
            {
                Symbol = "ALGOUSD",
                MarketSymbol = "ALGOUSDT",
                AsOfUtc = DateTime.UtcNow,
                Asks =
                {
                    new MarketDepthLevelDto { Price = 0.15m, Quantity = 10m }
                }
            }
        };

        var controller = new OrdersController(
            db,
            new PaperTradingService(db, marketData, ControllerTestHelpers.CreateLogger<PaperTradingService>()));
        ControllerTestHelpers.SetUser(controller, buyerId, isAdmin: false);

        var result = await controller.CreateOrder(new CreateOrderRequest
        {
            TypeOfOrder = OrderType.Buy,
            OrderKind = "Limit",
            Symbol = "ALGOUSD",
            Price = 0.10m,
            Amount = 8m
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var order = db.Orders.Single();
        Assert.That(order.OrderStatus, Is.EqualTo(OrderStatus.Open));
        Assert.That(order.Amount, Is.EqualTo(8m));
        Assert.That(db.OrderBookTable.Count(), Is.EqualTo(1));
        Assert.That(db.TradesTable, Is.Empty);

        var buyerUsdWallet = db.Wallets.Single(w => w.UserId == buyerId && w.Currency == "USD");
        Assert.That(buyerUsdWallet.Balance, Is.EqualTo(19.2m));
    }

    [Test]
    public async Task DeleteOrder_OpenLimitOrder_RefundsReservedBalance()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var buyerId = Guid.NewGuid();
        var order = new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = buyerId,
            TypeOfOrder = OrderType.Buy,
            Symbol = "ALGOUSD",
            Price = 0.10m,
            Amount = 8m,
            OrderStatus = OrderStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        db.Wallets.Add(new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = buyerId,
            Currency = "USD",
            Balance = 19.2m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        });
        db.Orders.Add(order);
        db.OrderBookTable.Add(new OrderBook
        {
            OrderBookId = Guid.NewGuid(),
            OrderId = order.OrderId,
            Symbol = order.Symbol,
            Price = order.Price,
            Amount = order.Amount,
            Timestamp = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var marketData = new FakeMarketDataService();
        var controller = new OrdersController(
            db,
            new PaperTradingService(db, marketData, ControllerTestHelpers.CreateLogger<PaperTradingService>()));
        ControllerTestHelpers.SetUser(controller, buyerId, isAdmin: false);

        var result = await controller.DeleteOrder(order.OrderId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.Orders, Is.Empty);
        Assert.That(db.OrderBookTable, Is.Empty);

        var buyerUsdWallet = db.Wallets.Single(w => w.UserId == buyerId && w.Currency == "USD");
        Assert.That(buyerUsdWallet.Balance, Is.EqualTo(20m));
    }
}
