using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/bank-accounts")]
[Authorize]
public class BankAccountsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public BankAccountsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid? userId)
    {
        if (!TryGetUserId(out var currentUserId)) return Unauthorized();

        var target = userId.HasValue && IsAdmin() ? userId.Value : currentUserId;

        var list = await _db.BankAccounts.AsNoTracking().Where(b => b.UserId == target).Select(b => new
        {
            b.BankAccountId,
            b.AccountHolderName,
            b.BankName,
            b.Iban,
            b.SwiftCode,
            b.Currency,
            b.CreatedAt
        }).ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BankAccountTable model)
    {
        if (!TryGetUserId(out var currentUserId)) return Unauthorized();

        var targetUserId = model.UserId != Guid.Empty ? model.UserId : currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId) return Forbid();

        var entity = new BankAccountTable
        {
            BankAccountId = Guid.NewGuid(),
            UserId = targetUserId,
            AccountHolderName = model.AccountHolderName ?? string.Empty,
            BankName = model.BankName ?? string.Empty,
            Iban = model.Iban ?? string.Empty,
            SwiftCode = model.SwiftCode ?? string.Empty,
            Currency = string.IsNullOrWhiteSpace(model.Currency) ? "USD" : model.Currency.ToUpperInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        _db.BankAccounts.Add(entity);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.BankAccountId }, entity);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] BankAccountTable model)
    {
        if (!TryGetUserId(out var currentUserId)) return Unauthorized();

        var entity = await _db.BankAccounts.FirstOrDefaultAsync(b => b.BankAccountId == id);
        if (entity == null) return NotFound();
        if (!IsAdmin() && entity.UserId != currentUserId) return Forbid();

        entity.AccountHolderName = model.AccountHolderName ?? entity.AccountHolderName;
        entity.BankName = model.BankName ?? entity.BankName;
        entity.Iban = model.Iban ?? entity.Iban;
        entity.SwiftCode = model.SwiftCode ?? entity.SwiftCode;
        entity.Currency = string.IsNullOrWhiteSpace(model.Currency) ? entity.Currency : model.Currency.ToUpperInvariant();

        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!TryGetUserId(out var currentUserId)) return Unauthorized();

        var entity = await _db.BankAccounts.FirstOrDefaultAsync(b => b.BankAccountId == id);
        if (entity == null) return NotFound();
        if (!IsAdmin() && entity.UserId != currentUserId) return Forbid();

        _db.BankAccounts.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
