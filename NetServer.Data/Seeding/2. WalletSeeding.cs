using Microsoft.AspNetCore.Identity;
using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class WalletSeeding
    {
        public static ICollection<WalletTable> GenerateWallets()
        {
            var wallets = new HashSet<WalletTable>();

            wallets.Add(new WalletTable
            {
                WalletID = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Currency = "BTC",////////Hardcode the currencies
                Balance = 0.5m,
                Addres = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",//Bitcoin genesis address
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            });
            //more properties
            //created by, modified on, modified by, deletd by, 
            // Every user will have the same password for convenience
            //asp. net core identity package
            //var hasher = new PasswordHasher<User>();
            //var hasher = new PasswordHasher<User>();
            //foreach (User user in users)d
            //{
            //    user.PasswordHash = hasher.HashPassword(user, "12h444hHndndHJ");
            //}

            return wallets;
        }
    }
}
