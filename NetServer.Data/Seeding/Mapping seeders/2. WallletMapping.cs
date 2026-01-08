using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;
using NetServer.Data.Seeding.Constants;
using NetServer.Data.Configurations;
namespace NetServer.Data.Seeding.Mapping_seeders
{
    public static class WalletMapping
    {
        public static ICollection<WalletTable> GenerateWallets()
        {
            DateTime createdOn = new DateTime(2025, 4, 20);
            ICollection<WalletTable> wallets = new HashSet<WalletTable>()
            {
                new WalletTable(DataSeedingConstants.WalletConstants.Wallet1Id, DataSeedingConstants.WalletConstants.User1Id, createdOn),
                new WalletTable(DataSeedingConstants.WalletConstants.Wallet1Id, DataSeedingConstants.WalletConstants.User1Id, createdOn),
                new WalletTable(DataSeedingConstants.WalletConstants.Wallet1Id, DataSeedingConstants.WalletConstants.User1Id, createdOn),
                new WalletTable(DataSeedingConstants.WalletConstants.Wallet1Id, DataSeedingConstants.WalletConstants.User1Id, createdOn)
            };
            return WalletSeeding.GenerateWallets();
        }
    }
}
