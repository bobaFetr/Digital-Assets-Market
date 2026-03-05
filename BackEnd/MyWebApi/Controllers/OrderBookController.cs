using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/orderbook")]
[Authorize]
public class OrderBookController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public OrderBookController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrderBook([FromQuery] string? symbol)
    {
        var query = _db.OrderBookTable.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(symbol))
        {
            query = query.Where(o => o.Symbol == symbol);
        }

        var entries = await query.Select(o => ToDto(o)).ToListAsync();
        return Ok(entries);
    }

    [HttpGet("{orderId:guid}")]
    public async Task<IActionResult> GetOrderBookEntry(Guid orderId)
    {
        var entry = await _db.OrderBookTable.AsNoTracking().FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (entry == null)
        {
            return NotFound();
        }

        return Ok(ToDto(entry));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateOrderBookEntry([FromBody] CreateOrderBookRequest request)
    {
        var entry = new OrderBook
        {
            OrderBookId = Guid.NewGuid(),
            OrderId = request.OrderId,
            Symbol = request.Symbol,
            Price = request.Price,
            Amount = request.Amount,
            Timestamp = request.Timestamp ?? DateTime.UtcNow
        };

        _db.OrderBookTable.Add(entry);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrderBookEntry), new { orderId = entry.OrderId }, ToDto(entry));
    }

    [HttpPut("{orderId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderBookEntry(Guid orderId, [FromBody] UpdateOrderBookRequest request)
    {
        var entry = await _db.OrderBookTable.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (entry == null)
        {
            return NotFound();
        }

        if (request.Symbol != null)
        {
            entry.Symbol = request.Symbol;
        }

        if (request.Price.HasValue)
        {
            entry.Price = request.Price.Value;
        }

        if (request.Amount.HasValue)
        {
            entry.Amount = request.Amount.Value;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(entry));
    }

    [HttpDelete("{orderId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteOrderBookEntry(Guid orderId)
    {
        var entry = await _db.OrderBookTable.FirstOrDefaultAsync(o => o.OrderId == orderId);
        if (entry == null)
        {
            return NotFound();
        }

        _db.OrderBookTable.Remove(entry);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static OrderBookDto ToDto(OrderBook entry)
    {
        return new OrderBookDto
        {
            OrderId = entry.OrderId,
            OrderBookId = entry.OrderBookId,
            Symbol = entry.Symbol,
            Price = entry.Price,
            Amount = entry.Amount,
            Timestamp = entry.Timestamp
        };
    }
}
