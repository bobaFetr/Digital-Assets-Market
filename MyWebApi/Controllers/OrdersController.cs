using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] Guid? userId, [FromQuery] OrderStatus? status, [FromQuery] string? symbol)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.Orders.AsNoTracking();

        if (IsAdmin())
        {
            if (userId.HasValue)
            {
                query = query.Where(o => o.UserId == userId.Value);
            }
        }
        else
        {
            query = query.Where(o => o.UserId == currentUserId);
        }

        if (!string.IsNullOrWhiteSpace(symbol))
        {
            query = query.Where(o => o.Symbol == symbol);
        }

        if (status.HasValue)
        {
            query = query.Where(o => o.OrderStatus == status.Value);
        }

        var orders = await query.Select(o => ToDto(o)).ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var order = await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.OrderId == id);
        if (order == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && order.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(order));
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var allowedSymbols = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "BTCUSD",
            "ETHUSD",
            "BNBUSD",
            "ALGOUSD",
            "BTCEUR",
            "ETHEUR",
            "BNBEUR",
            "ALGOEUR"
        };

        if (!allowedSymbols.Contains(request.Symbol))
        {
            return BadRequest("Unknown symbol.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        var isLimit = string.Equals(request.OrderKind, "Limit", StringComparison.OrdinalIgnoreCase);
        var isMarket = string.Equals(request.OrderKind, "Market", StringComparison.OrdinalIgnoreCase) || !isLimit;

        if (isLimit && request.Price <= 0)
        {
            return BadRequest("Limit orders require a price.");
        }

        var targetUserId = request.UserId ?? currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId)
        {
            return Forbid();
        }

        var now = DateTime.UtcNow;
        var oppositeType = request.TypeOfOrder == OrderType.Buy ? OrderType.Sell : OrderType.Buy;

        var orderBookQuery = _db.OrderBookTable.AsNoTracking()
            .Join(
                _db.Orders.AsNoTracking(),
                ob => ob.OrderId,
                o => o.OrderId,
                (ob, o) => new { OrderBook = ob, Order = o })
            .Where(x => x.Order.Symbol == request.Symbol
                && x.Order.TypeOfOrder == oppositeType
                && x.Order.OrderStatus == OrderStatus.Open);

        if (isLimit)
        {
            orderBookQuery = request.TypeOfOrder == OrderType.Buy
                ? orderBookQuery.Where(x => x.OrderBook.Price <= request.Price)
                : orderBookQuery.Where(x => x.OrderBook.Price >= request.Price);
        }

        orderBookQuery = request.TypeOfOrder == OrderType.Buy
            ? orderBookQuery.OrderBy(x => x.OrderBook.Price).ThenBy(x => x.OrderBook.Timestamp)
            : orderBookQuery.OrderByDescending(x => x.OrderBook.Price).ThenBy(x => x.OrderBook.Timestamp);

        var match = await orderBookQuery.FirstOrDefaultAsync();

        if (isMarket && match == null)
        {
            return BadRequest("No liquidity available for market order.");
        }

        var order = new OrdersTable
        {
            OrderId = Guid.NewGuid(),
            UserId = targetUserId,
            FeeTableId = request.FeeTableId,
            TypeOfOrder = request.TypeOfOrder,
            Symbol = request.Symbol,
            Price = isLimit ? request.Price : match!.OrderBook.Price,
            Amount = request.Amount,
            OrderStatus = match == null ? (request.OrderStatus ?? OrderStatus.Open) : OrderStatus.Filled,
            CreatedAt = now
        };

        _db.Orders.Add(order);

        if (match == null)
        {
            var fallbackPrice = order.Price > 0 ? order.Price : 1m;
            var orderBookEntry = new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                OrderId = order.OrderId,
                Symbol = order.Symbol,
                Price = fallbackPrice,
                Amount = order.Amount,
                Timestamp = order.CreatedAt
            };
            _db.OrderBookTable.Add(orderBookEntry);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, ToDto(order));
        }

        var matchedOrder = match.Order;
        matchedOrder.OrderStatus = OrderStatus.Filled;

        var matchedOrderBook = await _db.OrderBookTable
            .FirstOrDefaultAsync(ob => ob.OrderId == matchedOrder.OrderId);

        if (matchedOrderBook != null)
        {
            _db.OrderBookTable.Remove(matchedOrderBook);
        }

        var tradePrice = match.OrderBook.Price;
        var tradeAmount = Math.Min(order.Amount, match.OrderBook.Amount);
        var trade = new TradesTable
        {
            TradeId = Guid.NewGuid(),
            BuyOrderId = request.TypeOfOrder == OrderType.Buy ? order.OrderId : matchedOrder.OrderId,
            SellOrderId = request.TypeOfOrder == OrderType.Sell ? order.OrderId : matchedOrder.OrderId,
            Price = tradePrice,
            Amount = (double)tradeAmount,
            TimeStamp = now
        };

        _db.TradesTable.Add(trade);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, ToDto(order));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateOrder(Guid id, [FromBody] UpdateOrderRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.OrderId == id);
        if (order == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && order.UserId != currentUserId)
        {
            return Forbid();
        }

        if (request.FeeTableId.HasValue)
        {
            order.FeeTableId = request.FeeTableId;
        }

        if (request.Price.HasValue)
        {
            order.Price = request.Price.Value;
        }

        if (request.Amount.HasValue)
        {
            order.Amount = request.Amount.Value;
        }

        if (request.OrderStatus.HasValue)
        {
            order.OrderStatus = request.OrderStatus.Value;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(order));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOrder(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.OrderId == id);
        if (order == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && order.UserId != currentUserId)
        {
            return Forbid();
        }

        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static OrderDto ToDto(OrdersTable order)
    {
        return new OrderDto
        {
            OrderId = order.OrderId,
            UserId = order.UserId,
            FeeTableId = order.FeeTableId,
            TypeOfOrder = order.TypeOfOrder,
            Symbol = order.Symbol,
            Price = order.Price,
            Amount = order.Amount,
            OrderStatus = order.OrderStatus,
            CreatedAt = order.CreatedAt
        };
    }
}
