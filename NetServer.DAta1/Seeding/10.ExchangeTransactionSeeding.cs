using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
using System.Collections.Generic;
using System;

namespace NetServer.Data.Seeding
{
    public static class ExchangeTransactionSeeding
    {
        public static IEnumerable<ExchangeTransaction> GenerateExchangeTransactions()
        {
            var transactions = new HashSet<ExchangeTransaction>();
            transactions.Add(new ExchangeTransaction
            {
                TransactionID = Guid.Parse(DataSeedingConstants.ExchangeTransactionConstants.Transaction1Id),
                UserID = DataSeedingConstants.ExchangeTransactionConstants.User1Id,
                TypeOfTransaction = DataSeedingConstants.ExchangeTransactionConstants.TypeOfTransaction1,
                Currency = DataSeedingConstants.ExchangeTransactionConstants.Currency1,
                Amount = DataSeedingConstants.ExchangeTransactionConstants.Amount1,
                Status = DataSeedingConstants.ExchangeTransactionConstants.Status1,
                BlockchainTransactionHash = DataSeedingConstants.ExchangeTransactionConstants.BlockchainTransactionHash1,
                TimeStamp = DataSeedingConstants.ExchangeTransactionConstants.TimeStamp1
            });
            return transactions;
        }
    }
}
