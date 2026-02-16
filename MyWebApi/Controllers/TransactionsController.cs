using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public TransactionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetTransactions([FromQuery] Guid? userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.Transactions.AsNoTracking();

        if (IsAdmin())
        {
            if (userId.HasValue)
            {
                query = query.Where(t => t.UserID == userId.Value);
            }
        }
        else
        {
            query = query.Where(t => t.UserID == currentUserId);
        }

        var transactions = await query.Select(t => ToDto(t)).ToListAsync();
        return Ok(transactions);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTransaction(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var tx = await _db.Transactions.AsNoTracking().FirstOrDefaultAsync(t => t.TransactionID == id);
        if (tx == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && tx.UserID != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(tx));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateExchangeTransactionRequest request)
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

        var tx = new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = targetUserId,
            TypeOfTransaction = request.TypeOfTransaction,
            Currency = request.Currency,
            Amount = request.Amount,
            Status = request.Status,
            BlockchainTransactionHash = request.BlockchainTransactionHash,
            TimeStamp = request.TimeStamp ?? DateTime.UtcNow
        };

        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransaction), new { id = tx.TransactionID }, ToDto(tx));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UpdateExchangeTransactionRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var tx = await _db.Transactions.FirstOrDefaultAsync(t => t.TransactionID == id);
        if (tx == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && tx.UserID != currentUserId)
        {
            return Forbid();
        }

        if (request.Amount.HasValue)
        {
            tx.Amount = request.Amount.Value;
        }

        if (request.Status != null)
        {
            tx.Status = request.Status;
        }

        if (request.BlockchainTransactionHash != null)
        {
            tx.BlockchainTransactionHash = request.BlockchainTransactionHash;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(tx));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTransaction(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var tx = await _db.Transactions.FirstOrDefaultAsync(t => t.TransactionID == id);
        if (tx == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && tx.UserID != currentUserId)
        {
            return Forbid();
        }

        _db.Transactions.Remove(tx);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ExchangeTransactionDto ToDto(ExchangeTransaction tx)
    {
        return new ExchangeTransactionDto
        {
            TransactionId = tx.TransactionID,
            UserId = tx.UserID,
            TypeOfTransaction = tx.TypeOfTransaction,
            Currency = tx.Currency,
            Amount = tx.Amount,
            Status = tx.Status,
            BlockchainTransactionHash = tx.BlockchainTransactionHash,
            TimeStamp = tx.TimeStamp
        };
    }
}
