using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Services;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ApiControllerBase
{
    private readonly AppDbContext _db;
    private readonly PaperTradingService _paperTradingService;

    public OrdersController(AppDbContext db, PaperTradingService paperTradingService)
    {
        _db = db;
        _paperTradingService = paperTradingService;
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

        var targetUserId = request.UserId ?? currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId)
        {
            return Forbid();
        }

        var result = await _paperTradingService.PlaceOrderAsync(targetUserId, request);
        if (!result.Succeeded || result.Order == null)
        {
            return BadRequest(result.ErrorMessage);
        }

        return CreatedAtAction(nameof(GetOrder), new { id = result.Order.OrderId }, ToDto(result.Order));
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

        if (order.OrderStatus == OrderStatus.Open && (request.Price.HasValue || request.Amount.HasValue))
        {
            return BadRequest("Open orders cannot change price or amount. Cancel and recreate instead.");
        }

        if (request.OrderStatus == OrderStatus.Cancelled && order.OrderStatus == OrderStatus.Open)
        {
            await _paperTradingService.RefundReservedBalanceAsync(order);

            var orderBookEntry = await _db.OrderBookTable.FirstOrDefaultAsync(ob => ob.OrderId == order.OrderId);
            if (orderBookEntry != null)
            {
                _db.OrderBookTable.Remove(orderBookEntry);
            }
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

        if (order.OrderStatus == OrderStatus.Open)
        {
            await _paperTradingService.RefundReservedBalanceAsync(order);

            var orderBookEntry = await _db.OrderBookTable.FirstOrDefaultAsync(ob => ob.OrderId == order.OrderId);
            if (orderBookEntry != null)
            {
                _db.OrderBookTable.Remove(orderBookEntry);
            }
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
