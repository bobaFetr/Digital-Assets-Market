using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

namespace MyWebApi.Services;

public sealed class SimulatedPriceFeedService : BackgroundService
{
    private static readonly string[] Symbols =
    {
        "BTCUSD",
        "ETHUSD",
        "BNBUSD",
        "ALGOUSD"
    };

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SimulatedPriceFeedService> _logger;

    public SimulatedPriceFeedService(IServiceScopeFactory scopeFactory, ILogger<SimulatedPriceFeedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            foreach (var symbol in Symbols)
            {
                await TryInsertSimulatedPriceAsync(symbol, stoppingToken);
            }
        }
    }

    private async Task TryInsertSimulatedPriceAsync(string symbol, CancellationToken token)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var userId = await db.Users.AsNoTracking()
                .Select(u => u.Id)
                .FirstOrDefaultAsync(token);

            if (userId == Guid.Empty)
            {
                return;
            }

            var lastEntry = await db.OrderBookTable.AsNoTracking()
                .Where(ob => ob.Symbol == symbol)
                .OrderByDescending(ob => ob.Timestamp)
                .FirstOrDefaultAsync(token);

            var basePrice = lastEntry?.Price ?? GetSeedPrice(symbol);
            var delta = (decimal)(Random.Shared.NextDouble() * 0.004 - 0.002); // -0.2% to +0.2%
            var nextPrice = Math.Max(0.01m, basePrice * (1 + delta));
            var amount = (decimal)(Random.Shared.NextDouble() * 0.02 + 0.001);

            var now = DateTime.UtcNow;
            var orderId = Guid.NewGuid();

            var order = new OrdersTable
            {
                OrderId = orderId,
                UserId = userId,
                FeeTableId = null,
                TypeOfOrder = OrderType.Buy,
                Symbol = symbol,
                Price = nextPrice,
                Amount = amount,
                OrderStatus = OrderStatus.Open,
                CreatedAt = now
            };

            var orderBook = new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                OrderId = orderId,
                Symbol = symbol,
                Price = nextPrice,
                Amount = amount,
                Timestamp = now
            };

            db.Orders.Add(order);
            db.OrderBookTable.Add(orderBook);
            await db.SaveChangesAsync(token);

            var oldEntries = await db.OrderBookTable
                .Where(ob => ob.Symbol == symbol)
                .OrderByDescending(ob => ob.Timestamp)
                .Skip(200)
                .ToListAsync(token);

            if (oldEntries.Count > 0)
            {
                db.OrderBookTable.RemoveRange(oldEntries);
                await db.SaveChangesAsync(token);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error simulating orderbook for {Symbol}", symbol);
        }
    }

    private static decimal GetSeedPrice(string symbol)
    {
        return symbol switch
        {
            "BTCUSD" => 66000m,
            "ETHUSD" => 3500m,
            "BNBUSD" => 420m,
            "ALGOUSD" => 0.2m,
            _ => 1m
        };
    }
}
