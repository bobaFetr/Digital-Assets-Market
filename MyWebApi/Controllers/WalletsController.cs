using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/wallets")]
[Authorize]
public class WalletsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public WalletsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetWallets([FromQuery] Guid? userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.Wallets.AsNoTracking();

        if (IsAdmin())
        {
            if (userId.HasValue)
            {
                query = query.Where(w => w.UserId == userId.Value);
            }
        }
        else
        {
            query = query.Where(w => w.UserId == currentUserId);
        }

        var wallets = await query.Select(w => ToDto(w)).ToListAsync();
        return Ok(wallets);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetWallet(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var wallet = await _db.Wallets.AsNoTracking().FirstOrDefaultAsync(w => w.WalletID == id);
        if (wallet == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && wallet.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(wallet));
    }

    [HttpPost]
    public async Task<IActionResult> CreateWallet([FromBody] CreateWalletRequest request)
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

        var wallet = new WalletTable
        {
            WalletID = Guid.NewGuid(),
            UserId = targetUserId,
            Currency = request.Currency,
            Balance = request.Balance,
            Addres = request.Address,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _db.Wallets.Add(wallet);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWallet), new { id = wallet.WalletID }, ToDto(wallet));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateWallet(Guid id, [FromBody] UpdateWalletRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.WalletID == id);
        if (wallet == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && wallet.UserId != currentUserId)
        {
            return Forbid();
        }

        if (request.Currency != null)
        {
            wallet.Currency = request.Currency;
        }

        if (request.Balance.HasValue)
        {
            wallet.Balance = request.Balance.Value;
        }

        if (request.Address != null)
        {
            wallet.Addres = request.Address;
        }

        if (request.Status != null)
        {
            wallet.Status = request.Status;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(wallet));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWallet(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.WalletID == id);
        if (wallet == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && wallet.UserId != currentUserId)
        {
            return Forbid();
        }

        _db.Wallets.Remove(wallet);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static WalletDto ToDto(WalletTable wallet)
    {
        return new WalletDto
        {
            WalletId = wallet.WalletID,
            UserId = wallet.UserId,
            Currency = wallet.Currency,
            Balance = wallet.Balance,
            Address = wallet.Addres,
            Status = wallet.Status,
            CreatedAt = wallet.CreatedAt
        };
    }
}
