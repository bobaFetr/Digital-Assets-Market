using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/blockchain-events")]
[Authorize]
public class BlockchainEventsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public BlockchainEventsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvents([FromQuery] Guid? exchangeTransactionId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.BlockchainEvents.AsNoTracking();

        if (IsAdmin())
        {
            if (exchangeTransactionId.HasValue)
            {
                query = query.Where(e => e.ExchangeTransactionId == exchangeTransactionId.Value);
            }
        }
        else
        {
            var userTxIds = _db.Transactions.AsNoTracking()
                .Where(t => t.UserID == currentUserId)
                .Select(t => t.TransactionID);

            query = query.Where(e => userTxIds.Contains(e.ExchangeTransactionId));

            if (exchangeTransactionId.HasValue)
            {
                query = query.Where(e => e.ExchangeTransactionId == exchangeTransactionId.Value);
            }
        }

        var events = await query.Select(e => ToDto(e)).ToListAsync();
        return Ok(events);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetEvent(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var evt = await _db.BlockchainEvents.AsNoTracking().FirstOrDefaultAsync(e => e.EventId == id);
        if (evt == null)
        {
            return NotFound();
        }

        if (!IsAdmin())
        {
            var belongsToUser = await _db.Transactions.AsNoTracking()
                .AnyAsync(t => t.TransactionID == evt.ExchangeTransactionId && t.UserID == currentUserId);

            if (!belongsToUser)
            {
                return Forbid();
            }
        }

        return Ok(ToDto(evt));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateEvent([FromBody] CreateBlockchainEventRequest request)
    {
        var evt = new BlockchainEvent
        {
            EventId = Guid.NewGuid(),
            ExchangeTransactionId = request.ExchangeTransactionId,
            TxHash = request.TxHash,
            EventType = request.EventType,
            Status = request.Status,
            Timestamp = request.Timestamp ?? DateTime.UtcNow
        };

        _db.BlockchainEvents.Add(evt);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvent), new { id = evt.EventId }, ToDto(evt));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateBlockchainEventRequest request)
    {
        var evt = await _db.BlockchainEvents.FirstOrDefaultAsync(e => e.EventId == id);
        if (evt == null)
        {
            return NotFound();
        }

        if (request.TxHash != null)
        {
            evt.TxHash = request.TxHash;
        }

        if (request.EventType != null)
        {
            evt.EventType = request.EventType;
        }

        if (request.Status != null)
        {
            evt.Status = request.Status;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(evt));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEvent(Guid id)
    {
        var evt = await _db.BlockchainEvents.FirstOrDefaultAsync(e => e.EventId == id);
        if (evt == null)
        {
            return NotFound();
        }

        _db.BlockchainEvents.Remove(evt);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static BlockchainEventDto ToDto(BlockchainEvent evt)
    {
        return new BlockchainEventDto
        {
            EventId = evt.EventId,
            ExchangeTransactionId = evt.ExchangeTransactionId,
            TxHash = evt.TxHash,
            EventType = evt.EventType,
            Status = evt.Status,
            Timestamp = evt.Timestamp
        };
    }
}
