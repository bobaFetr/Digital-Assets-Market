using NetServer.Data;
using NetServer.Data.Models;

namespace MyWebApi.Services;

public class WalletProvisioningService
{
    public static readonly string[] DefaultWalletCurrencies = ["USD", "EUR", "BTC", "ETH", "BNB", "ALGO", "USDT"];

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
        var existingCurrencies = _db.Wallets
            .Where(w => w.UserId == userId)
            .Select(w => w.Currency)
            .ToList()
            .Select(c => c?.Trim().ToUpperInvariant() ?? string.Empty)
            .ToHashSet();

        var created = 0;
        foreach (var currency in DefaultWalletCurrencies)
        {
            if (existingCurrencies.Contains(currency))
            {
                continue;
            }

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

        return created;
    }
}
