using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

namespace MyWebApi.Services;

public sealed class PaperTradingService
{
    private readonly AppDbContext _db;
    private readonly IMarketDataService _marketDataService;
    private readonly ILogger<PaperTradingService> _logger;

    public PaperTradingService(AppDbContext db, IMarketDataService marketDataService, ILogger<PaperTradingService> logger)
    {
        _db = db;
        _marketDataService = marketDataService;
        _logger = logger;
    }

    public async Task<PaperOrderPlacementResult> PlaceOrderAsync(Guid userId, CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        if (!_marketDataService.TryMapSymbol(request.Symbol, out _))
        {
            return PaperOrderPlacementResult.Fail("Unknown symbol.");
        }

        if (request.Amount <= 0)
        {
            return PaperOrderPlacementResult.Fail("Amount must be greater than zero.");
        }

        var isLimit = string.Equals(request.OrderKind, "Limit", StringComparison.OrdinalIgnoreCase);
        var isMarket = !isLimit;
        if (isLimit && request.Price <= 0)
        {
            return PaperOrderPlacementResult.Fail("Limit orders require a price.");
        }

        var (baseCurrency, quoteCurrency) = ParseSymbol(request.Symbol);
        if (string.IsNullOrWhiteSpace(baseCurrency) || string.IsNullOrWhiteSpace(quoteCurrency))
        {
            return PaperOrderPlacementResult.Fail("Unsupported symbol format.");
        }

        var depth = await _marketDataService.GetDepthAsync(request.Symbol, 100, cancellationToken);
        if (depth == null)
        {
            return PaperOrderPlacementResult.Fail("Real market data is currently unavailable.");
        }

        var eligibleLevels = GetExecutableLevels(depth, request.TypeOfOrder, isLimit ? request.Price : null).ToList();
        if (isMarket)
        {
            var totalLiquidity = eligibleLevels.Sum(level => level.Quantity);
            if (totalLiquidity <= 0)
            {
                return PaperOrderPlacementResult.Fail("No market liquidity available right now.");
            }

            if (totalLiquidity < request.Amount)
            {
                return PaperOrderPlacementResult.Fail("Not enough market liquidity available.");
            }
        }

        decimal reservedBuyAmount = 0m;
        if (request.TypeOfOrder == OrderType.Buy)
        {
            reservedBuyAmount = isLimit
                ? request.Price * request.Amount
                : CalculateDepthCost(eligibleLevels, request.Amount);

            var quoteWallet = await GetOrCreateWalletAsync(userId, quoteCurrency, cancellationToken);
            if (quoteWallet.Balance < reservedBuyAmount)
            {
                return PaperOrderPlacementResult.Fail($"Insufficient {quoteCurrency} balance.");
            }

            quoteWallet.Balance -= reservedBuyAmount;
        }
        else
        {
            var baseWallet = await GetOrCreateWalletAsync(userId, baseCurrency, cancellationToken);
            if (baseWallet.Balance < request.Amount)
            {
                return PaperOrderPlacementResult.Fail($"Insufficient {baseCurrency} balance.");
            }

            baseWallet.Balance -= request.Amount;
        }

        var initialPrice = isLimit
            ? request.Price
            : GetInitialExecutionPrice(request.TypeOfOrder, depth);

        if (initialPrice <= 0)
        {
            return PaperOrderPlacementResult.Fail("No executable market price is available.");
        }

        var now = DateTime.UtcNow;
        var requestedAmount = request.Amount;
        var order = new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = userId,
            FeeTableId = request.FeeTableId,
            TypeOfOrder = request.TypeOfOrder,
            Symbol = request.Symbol.Trim().ToUpperInvariant(),
            Price = initialPrice,
            Amount = requestedAmount,
            OrderStatus = OrderStatus.Open,
            CreatedAt = now
        };

        _db.Orders.Add(order);

        var remainingAmount = requestedAmount;
        if (eligibleLevels.Count > 0)
        {
            remainingAmount = await ExecuteAgainstLevelsAsync(order, baseCurrency, quoteCurrency, eligibleLevels, remainingAmount, cancellationToken);
        }

        if (remainingAmount <= 0)
        {
            order.OrderStatus = OrderStatus.Filled;
            order.Amount = requestedAmount;
        }
        else if (isLimit)
        {
            order.OrderStatus = OrderStatus.Open;
            order.Amount = remainingAmount;

            _db.OrderBookTable.Add(new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                OrderId = order.OrderId,
                Symbol = order.Symbol,
                Price = request.Price,
                Amount = remainingAmount,
                Timestamp = now
            });
        }
        else
        {
            return PaperOrderPlacementResult.Fail("Unable to fully execute the market order.");
        }

        await _db.SaveChangesAsync(cancellationToken);
        return PaperOrderPlacementResult.Success(order);
    }

    public async Task<int> ProcessOpenOrdersAsync(CancellationToken cancellationToken = default)
    {
        var openOrders = await _db.Orders
            .Where(o => o.OrderStatus == OrderStatus.Open)
            .Join(
                _db.OrderBookTable,
                order => order.OrderId,
                orderBook => orderBook.OrderId,
                (order, orderBook) => new { Order = order, OrderBook = orderBook })
            .OrderBy(x => x.Order.CreatedAt)
            .ToListAsync(cancellationToken);

        if (openOrders.Count == 0)
        {
            return 0;
        }

        var processedOrders = 0;
        foreach (var group in openOrders.GroupBy(x => x.Order.Symbol, StringComparer.OrdinalIgnoreCase))
        {
            var depth = await _marketDataService.GetDepthAsync(group.Key, 100, cancellationToken);
            if (depth == null)
            {
                continue;
            }

            var (baseCurrency, quoteCurrency) = ParseSymbol(group.Key);
            if (string.IsNullOrWhiteSpace(baseCurrency) || string.IsNullOrWhiteSpace(quoteCurrency))
            {
                continue;
            }

            foreach (var item in group)
            {
                var alreadyExecutedAmount = await GetExecutedAmountAsync(item.Order.OrderId, cancellationToken);
                var outstandingAmount = item.Order.Amount;
                var eligibleLevels = GetExecutableLevels(depth, item.Order.TypeOfOrder, item.Order.Price).ToList();
                if (eligibleLevels.Count == 0)
                {
                    continue;
                }

                var remainingAmount = outstandingAmount;
                remainingAmount = await ExecuteAgainstLevelsAsync(item.Order, baseCurrency, quoteCurrency, eligibleLevels, remainingAmount, cancellationToken);
                if (remainingAmount <= 0)
                {
                    item.Order.OrderStatus = OrderStatus.Filled;
                    item.Order.Amount = alreadyExecutedAmount + outstandingAmount;
                    _db.OrderBookTable.Remove(item.OrderBook);
                    processedOrders++;
                }
                else if (remainingAmount < outstandingAmount)
                {
                    item.Order.Amount = remainingAmount;
                    item.OrderBook.Amount = remainingAmount;
                    item.OrderBook.Timestamp = DateTime.UtcNow;
                    processedOrders++;
                }
            }
        }

        if (processedOrders > 0)
        {
            await _db.SaveChangesAsync(cancellationToken);
        }

        return processedOrders;
    }

    public async Task RefundReservedBalanceAsync(OrdersTable order, CancellationToken cancellationToken = default)
    {
        var (baseCurrency, quoteCurrency) = ParseSymbol(order.Symbol);
        if (string.IsNullOrWhiteSpace(baseCurrency) || string.IsNullOrWhiteSpace(quoteCurrency))
        {
            return;
        }

        if (order.TypeOfOrder == OrderType.Buy)
        {
            var quoteWallet = await GetOrCreateWalletAsync(order.UserId, quoteCurrency, cancellationToken);
            quoteWallet.Balance += order.Price * order.Amount;
        }
        else
        {
            var baseWallet = await GetOrCreateWalletAsync(order.UserId, baseCurrency, cancellationToken);
            baseWallet.Balance += order.Amount;
        }
    }

    private async Task<decimal> ExecuteAgainstLevelsAsync(
        OrdersTable order,
        string baseCurrency,
        string quoteCurrency,
        IReadOnlyList<MarketDepthLevelDto> levels,
        decimal remainingAmount,
        CancellationToken cancellationToken)
    {
        foreach (var level in levels)
        {
            if (remainingAmount <= 0)
            {
                break;
            }

            var tradeAmount = Math.Min(remainingAmount, level.Quantity);
            if (tradeAmount <= 0 || level.Price <= 0)
            {
                continue;
            }

            var tradeValue = tradeAmount * level.Price;
            remainingAmount -= tradeAmount;

            _db.TradesTable.Add(new TradesTable
            {
                TradeId = Guid.NewGuid(),
                BuyOrderId = order.OrderId,
                SellOrderId = order.TypeOfOrder == OrderType.Sell ? order.OrderId : null,
                Price = level.Price,
                Amount = (double)tradeAmount,
                TimeStamp = DateTime.UtcNow
            });

            if (order.TypeOfOrder == OrderType.Buy)
            {
                var baseWallet = await GetOrCreateWalletAsync(order.UserId, baseCurrency, cancellationToken);
                baseWallet.Balance += tradeAmount;

                if (order.Price > level.Price)
                {
                    var refund = (order.Price - level.Price) * tradeAmount;
                    if (refund > 0)
                    {
                        var quoteWallet = await GetOrCreateWalletAsync(order.UserId, quoteCurrency, cancellationToken);
                        quoteWallet.Balance += refund;
                    }
                }
            }
            else
            {
                var quoteWallet = await GetOrCreateWalletAsync(order.UserId, quoteCurrency, cancellationToken);
                quoteWallet.Balance += tradeValue;
            }
        }

        return remainingAmount;
    }

    private IEnumerable<MarketDepthLevelDto> GetExecutableLevels(MarketDepthDto depth, OrderType orderType, decimal? limitPrice)
    {
        if (orderType == OrderType.Buy)
        {
            return depth.Asks
                .Where(level => level.Quantity > 0 && (!limitPrice.HasValue || level.Price <= limitPrice.Value))
                .OrderBy(level => level.Price);
        }

        return depth.Bids
            .Where(level => level.Quantity > 0 && (!limitPrice.HasValue || level.Price >= limitPrice.Value))
            .OrderByDescending(level => level.Price);
    }

    private static decimal CalculateDepthCost(IEnumerable<MarketDepthLevelDto> levels, decimal requestedAmount)
    {
        decimal remainingAmount = requestedAmount;
        decimal totalCost = 0m;

        foreach (var level in levels)
        {
            if (remainingAmount <= 0)
            {
                break;
            }

            var tradeAmount = Math.Min(remainingAmount, level.Quantity);
            if (tradeAmount <= 0)
            {
                continue;
            }

            totalCost += tradeAmount * level.Price;
            remainingAmount -= tradeAmount;
        }

        return totalCost;
    }

    private static decimal GetInitialExecutionPrice(OrderType orderType, MarketDepthDto depth)
    {
        return orderType == OrderType.Buy
            ? depth.Asks.FirstOrDefault()?.Price ?? 0m
            : depth.Bids.FirstOrDefault()?.Price ?? 0m;
    }

    private async Task<decimal> GetExecutedAmountAsync(Guid orderId, CancellationToken cancellationToken)
    {
        return (decimal)await _db.TradesTable
            .Where(t => t.BuyOrderId == orderId || t.SellOrderId == orderId)
            .SumAsync(t => t.Amount, cancellationToken);
    }

    private async Task<WalletTable> GetOrCreateWalletAsync(Guid userId, string currency, CancellationToken cancellationToken)
    {
        var normalizedCurrency = currency.Trim().ToUpperInvariant();
        var wallet = _db.Wallets.Local.FirstOrDefault(w => w.UserId == userId && w.Currency == normalizedCurrency);
        if (wallet != null)
        {
            return wallet;
        }

        wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId && w.Currency == normalizedCurrency, cancellationToken);
        if (wallet != null)
        {
            return wallet;
        }

        wallet = new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = userId,
            Currency = normalizedCurrency,
            Balance = 0m,
            Addres = string.Empty,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        _db.Wallets.Add(wallet);
        return wallet;
    }

    private static (string BaseCurrency, string QuoteCurrency) ParseSymbol(string symbol)
    {
        var normalized = (symbol ?? string.Empty).Trim().ToUpperInvariant();
        foreach (var quote in new[] { "USD", "EUR" })
        {
            if (normalized.EndsWith(quote, StringComparison.Ordinal) && normalized.Length > quote.Length)
            {
                return (normalized[..^quote.Length], quote);
            }
        }

        return (string.Empty, string.Empty);
    }
}

public sealed class PaperOrderPlacementResult
{
    public bool Succeeded { get; private init; }
    public string? ErrorMessage { get; private init; }
    public OrdersTable? Order { get; private init; }

    public static PaperOrderPlacementResult Success(OrdersTable order) => new()
    {
        Succeeded = true,
        Order = order
    };

    public static PaperOrderPlacementResult Fail(string errorMessage) => new()
    {
        Succeeded = false,
        ErrorMessage = errorMessage
    };
}
