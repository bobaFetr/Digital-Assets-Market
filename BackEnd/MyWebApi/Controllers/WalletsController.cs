using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/wallets")]
[Authorize]
public class WalletsController : ApiControllerBase
{
    private readonly AppDbContext _db;
    private readonly MyWebApi.Services.WalletProvisioningService? _walletProvisioning;

    public WalletsController(AppDbContext db)
    {
        _db = db;
        _walletProvisioning = new MyWebApi.Services.WalletProvisioningService(db);
    }

    public WalletsController(AppDbContext db, MyWebApi.Services.WalletProvisioningService walletProvisioning)
    {
        _db = db;
        _walletProvisioning = walletProvisioning;
    }

    [HttpGet]
    public async Task<IActionResult> GetWallets([FromQuery] Guid? userId, [FromQuery] bool includeAll = false)
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
            else if (!includeAll)
            {
                query = query.Where(w => w.UserId == currentUserId);
            }
        }
        else
        {
            query = query.Where(w => w.UserId == currentUserId);
        }

        var wallets = await query.Select(w => ToDto(w)).ToListAsync();
        return Ok(wallets);
    }

    [HttpPost("ensure-default")]
    public IActionResult EnsureDefaultWallets([FromBody] EnsureDefaultWalletsRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var targetUserId = request?.UserId ?? currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId)
        {
            return Forbid();
        }

        var created = _walletProvisioning?.EnsureDefaultWalletsForUser(targetUserId, request?.BankAccountCurrencies, request?.InitialCryptoCurrencies) ?? 0;
        return Ok(new { created });
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

    [HttpGet("card-details")]
    public async Task<IActionResult> GetSavedCardDetails()
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var card = await _db.CreditCardDetails.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == currentUserId);
        if (card == null)
        {
            // No saved card for the user — return 204 No Content so the browser doesn't treat it as an error
            return NoContent();
        }

        return Ok(ToCardDetailsDto(card));
    }

    [HttpPost("deposit-card")]
    public async Task<IActionResult> AddMoneyFromCard([FromBody] AddMoneyByCardRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        if (request == null)
        {
            return BadRequest("Request is required.");
        }

        var normalizedCurrency = (request.Currency ?? string.Empty).Trim().ToUpperInvariant();
        if (normalizedCurrency != "USD" && normalizedCurrency != "EUR")
        {
            return BadRequest("Only USD and EUR card deposits are supported.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        if (request.Amount > 100000m)
        {
            return BadRequest("Amount exceeds single transaction limit.");
        }

        var existingCard = await _db.CreditCardDetails.FirstOrDefaultAsync(c => c.UserId == currentUserId);

        var cardDigits = Regex.Replace(request.CardNumber ?? string.Empty, "[^0-9]", string.Empty);
        var cvvDigits = Regex.Replace(request.Cvv ?? string.Empty, "[^0-9]", string.Empty);
        var hasSubmittedCardData =
            !string.IsNullOrWhiteSpace(request.CardHolderName)
            || !string.IsNullOrWhiteSpace(request.CardNumber)
            || !string.IsNullOrWhiteSpace(request.Cvv)
            || !string.IsNullOrWhiteSpace(request.ExpiryDate);

        if (existingCard == null && !hasSubmittedCardData)
        {
            return BadRequest("Card details are required for the first deposit.");
        }

        if (hasSubmittedCardData)
        {
            if (cardDigits.Length < 12 || cardDigits.Length > 19)
            {
                return BadRequest("Card number is invalid.");
            }

            if (cvvDigits.Length < 3 || cvvDigits.Length > 4)
            {
                return BadRequest("CVV is invalid.");
            }

            if (string.IsNullOrWhiteSpace(request.CardHolderName))
            {
                return BadRequest("Card holder name is required.");
            }

            if (!TryParseExpiryDate(request.ExpiryDate ?? string.Empty, out var expiryDateUtc))
            {
                return BadRequest("Expiry date must be in MM/YY format.");
            }

            if (expiryDateUtc < DateTime.UtcNow)
            {
                return BadRequest("Card is expired.");
            }

            var now = DateTime.UtcNow;
            var normalizedHolderName = request.CardHolderName.Trim();
            var normalizedExpiry = request.ExpiryDate!.Trim();
            var last4 = cardDigits[^4..];

            if (existingCard == null)
            {
                existingCard = new CreditCardDetailsTable
                {
                    UserId = currentUserId,
                    CardHolderName = normalizedHolderName,
                    CardLast4 = last4,
                    ExpiryDate = normalizedExpiry,
                    Currency = normalizedCurrency,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _db.CreditCardDetails.Add(existingCard);
            }
            else
            {
                existingCard.CardHolderName = normalizedHolderName;
                existingCard.CardLast4 = last4;
                existingCard.ExpiryDate = normalizedExpiry;
                existingCard.Currency = normalizedCurrency;
                existingCard.UpdatedAt = now;
            }
        }
        else if (existingCard != null && string.IsNullOrWhiteSpace(normalizedCurrency))
        {
            normalizedCurrency = existingCard.Currency;
        }

        var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == currentUserId && w.Currency == normalizedCurrency);
        if (wallet == null)
        {
            wallet = new WalletTable
            {
                WalletID = Guid.NewGuid(),
                UserId = currentUserId,
                Currency = normalizedCurrency,
                Balance = 0m,
                Addres = string.Empty,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };
            _db.Wallets.Add(wallet);
        }

        wallet.Balance += request.Amount;

        var transactionLast4 = existingCard?.CardLast4 ?? (cardDigits.Length >= 4 ? cardDigits[^4..] : "0000");
        _db.Transactions.Add(new ExchangeTransaction
        {
            TransactionID = Guid.NewGuid(),
            UserID = currentUserId,
            TypeOfTransaction = "CardDeposit",
            Currency = normalizedCurrency,
            Amount = request.Amount,
            Status = "Completed",
            BlockchainTransactionHash = $"CARD-XXXX-{transactionLast4}",
            TimeStamp = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(ToDto(wallet));
    }

    private static bool TryParseExpiryDate(string expiryDate, out DateTime expiryDateUtc)
    {
        expiryDateUtc = DateTime.MinValue;
        if (string.IsNullOrWhiteSpace(expiryDate))
        {
            return false;
        }

        var match = Regex.Match(expiryDate.Trim(), "^(0[1-9]|1[0-2])\\/(\\d{2})$");
        if (!match.Success)
        {
            return false;
        }

        var month = int.Parse(match.Groups[1].Value);
        var year = 2000 + int.Parse(match.Groups[2].Value);
        var firstDayNextMonth = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
        expiryDateUtc = firstDayNextMonth.AddTicks(-1);
        return true;
    }

    private static CreditCardDetailsDto ToCardDetailsDto(CreditCardDetailsTable card)
    {
        return new CreditCardDetailsDto
        {
            CreditCardId = card.UserId,
            UserId = card.UserId,
            CardHolderName = card.CardHolderName,
            CardLast4 = card.CardLast4,
            ExpiryDate = card.ExpiryDate,
            Currency = card.Currency,
            CreatedAt = card.CreatedAt,
            UpdatedAt = card.UpdatedAt
        };
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
