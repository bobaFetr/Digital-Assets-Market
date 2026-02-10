using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/trades")]
[Authorize]
public class TradesController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public TradesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrades([FromQuery] Guid? orderId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        if (!IsAdmin())
        {
            if (!orderId.HasValue)
            {
                return Forbid();
            }

            var orderUserId = await _db.Orders.AsNoTracking()
                .Where(o => o.OrderId == orderId.Value)
                .Select(o => o.UserId)
                .FirstOrDefaultAsync();

            if (orderUserId == Guid.Empty || orderUserId != currentUserId)
            {
                return Forbid();
            }
        }

        var query = _db.TradesTable.AsNoTracking();

        if (orderId.HasValue)
        {
            query = query.Where(t => t.BuyOrderId == orderId.Value || t.SellOrderId == orderId.Value);
        }

        var trades = await query.Select(t => ToDto(t)).ToListAsync();
        return Ok(trades);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTrade(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var trade = await _db.TradesTable.AsNoTracking().FirstOrDefaultAsync(t => t.TradeId == id);
        if (trade == null)
        {
            return NotFound();
        }

        if (!IsAdmin())
        {
            var orderUserIds = await _db.Orders.AsNoTracking()
                .Where(o => o.OrderId == trade.BuyOrderId || o.OrderId == trade.SellOrderId)
                .Select(o => o.UserId)
                .ToListAsync();

            if (!orderUserIds.Contains(currentUserId))
            {
                return Forbid();
            }
        }

        return Ok(ToDto(trade));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTrade([FromBody] CreateTradeRequest request)
    {
        var trade = new TradesTable
        {
            TradeId = Guid.NewGuid(),
            BuyOrderId = request.BuyOrderId,
            SellOrderId = request.SellOrderId,
            Price = request.Price,
            Amount = request.Amount,
            TimeStamp = request.TimeStamp ?? DateTime.UtcNow
        };

        _db.TradesTable.Add(trade);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTrade), new { id = trade.TradeId }, ToDto(trade));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTrade(Guid id, [FromBody] CreateTradeRequest request)
    {
        var trade = await _db.TradesTable.FirstOrDefaultAsync(t => t.TradeId == id);
        if (trade == null)
        {
            return NotFound();
        }

        trade.BuyOrderId = request.BuyOrderId;
        trade.SellOrderId = request.SellOrderId;
        trade.Price = request.Price;
        trade.Amount = request.Amount;
        trade.TimeStamp = request.TimeStamp ?? trade.TimeStamp;

        await _db.SaveChangesAsync();
        return Ok(ToDto(trade));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTrade(Guid id)
    {
        var trade = await _db.TradesTable.FirstOrDefaultAsync(t => t.TradeId == id);
        if (trade == null)
        {
            return NotFound();
        }

        _db.TradesTable.Remove(trade);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static TradeDto ToDto(TradesTable trade)
    {
        return new TradeDto
        {
            TradeId = trade.TradeId,
            BuyOrderId = trade.BuyOrderId,
            SellOrderId = trade.SellOrderId,
            Price = trade.Price,
            Amount = trade.Amount,
            TimeStamp = trade.TimeStamp
        };
    }
}
