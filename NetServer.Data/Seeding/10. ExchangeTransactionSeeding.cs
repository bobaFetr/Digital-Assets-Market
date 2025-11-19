using Microsoft.AspNetCore.Identity;
using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public  class ExchangeTransactionSeeding
    {
        public static ICollection<ExchangeTransaction> GenerateTrades()
        {
            var exchangeTransactions = new HashSet<ExchangeTransaction>();
            exchangeTransactions.Add(new ExchangeTransaction
            {
                TransactionID = Guid.NewGuid(),
                UserID = Guid.NewGuid(),
                TypeOfTransaction = "Deposit",
                Currency = "BTC",
                Amount = 0.5m,
                Status = "Completed",
                BlockchainTransactionHash = "0xabc123...",
                TimeStamp = DateTime.UtcNow
            });
            var hasher = new PasswordHasher<ExchangeTransaction>();
            foreach (ExchangeTransaction transactions in exchangeTransactions)
            {
                transactions.BlockchainTransactionHash = hasher.HashPassword(transactions, "12h444hHndndHJ");
            }
            return exchangeTransactions;
        }
    }
}
