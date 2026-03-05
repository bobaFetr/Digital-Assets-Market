using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;

namespace NetServer.Data.Seeding
{
    public static class WalletSeeding //: IEntityTypeConfiguration<WalletTable>
    {
        public static ICollection<WalletTable> GenerateWallets()
        {
            var wallets = new HashSet<WalletTable>();

            wallets.Add(new WalletTable
            {
                WalletID = DataSeedingConstants.WalletConstants.Wallet1Id,
                UserId = DataSeedingConstants.WalletConstants.User1Id,
                Currency = DataSeedingConstants.WalletConstants.Currency1,
                Balance = DataSeedingConstants.WalletConstants.Balance1,
                Addres = DataSeedingConstants.WalletConstants.Address1,
                Status = DataSeedingConstants.WalletConstants.Status1,                
                CreatedAt = DataSeedingConstants.WalletConstants.CreatedAt1
            });

            return wallets;
        }
    }
}