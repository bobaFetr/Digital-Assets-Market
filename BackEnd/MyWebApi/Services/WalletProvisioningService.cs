using NetServer.Data;
using NetServer.Data.Models;

namespace MyWebApi.Services;

public class WalletProvisioningService
{
    // Backwards-compatible list used by other parts of the codebase
    public static readonly string[] DefaultWalletCurrencies = new[] { "USD", "EUR", "BTC", "ETH", "BNB", "ALGO", "USDT" };

    // Known bank currencies
    private static readonly string[] BankCurrencies = new[] { "USD", "EUR" };

    // Known crypto currencies we may create on demand
    private static readonly string[] KnownCryptoCurrencies = new[] { "BTC", "ETH", "BNB", "ALGO", "USDT" };

    private readonly AppDbContext _db;

    public WalletProvisioningService(AppDbContext db)
    {
        _db = db;
    }

    public int EnsureDefaultWalletsForAllUsers()
    {
        var userIds = _db.Users.Select(u => u.Id).ToList();
        var created = 0;

        foreach (var userId in userIds)
        {
            created += EnsureDefaultWalletsForUser(userId);
        }

        return created;
    }

    public int EnsureDefaultWalletsForUser(Guid userId)
    {
        var hasAnyWallets = _db.Wallets.Any(w => w.UserId == userId);
        if (hasAnyWallets)
        {
            return 0;
        }

        return EnsureDefaultWalletsForUser(userId, BankCurrencies, KnownCryptoCurrencies);
    }

    // Create wallets for requested bank currencies (USD/EUR) and requested crypto currencies (e.g. USDT)
    public int EnsureDefaultWalletsForUser(Guid userId, IEnumerable<string>? bankCurrencies, IEnumerable<string>? cryptoCurrencies)
    {
        var requested = new System.Collections.Generic.List<string>();

        if (bankCurrencies != null)
        {
            foreach (var b in bankCurrencies)
            {
                if (string.IsNullOrWhiteSpace(b)) continue;
                var code = b.Trim().ToUpperInvariant();
                if (BankCurrencies.Contains(code)) requested.Add(code);
            }
        }

        if (cryptoCurrencies != null)
        {
            foreach (var c in cryptoCurrencies)
            {
                if (string.IsNullOrWhiteSpace(c)) continue;
                var code = c.Trim().ToUpperInvariant();
                if (KnownCryptoCurrencies.Contains(code)) requested.Add(code);
            }
        }

        if (!requested.Any()) return 0;

        var existingCurrencies = _db.Wallets
            .Where(w => w.UserId == userId)
            .Select(w => w.Currency)
            .ToList()
            .Select(c => c?.Trim().ToUpperInvariant() ?? string.Empty)
            .ToHashSet();

        var created = 0;
        foreach (var currency in requested.Distinct())
        {
            if (existingCurrencies.Contains(currency)) continue;

            _db.Wallets.Add(new WalletTable
            {
                WalletID = Guid.NewGuid(),
                UserId = userId,
                Currency = currency,
                Balance = 0m,
                Addres = string.Empty,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            });
            created++;
        }

        if (created > 0) _db.SaveChanges();
        return created;
    }
}
