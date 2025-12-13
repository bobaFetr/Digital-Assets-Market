using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class ExchangeTransactionConfiguration
    {
        public void Configure(EntityTypeBuilder<ExchangeTransaction> builder)
        {
            builder.HasKey(e => e.TransactionID);

            builder.HasData(ExchangeTransactionSeeding.GenerateExchangeTransactions());

            //builder.HasOne(e => e.User)
            //       .WithMany(u => u.ExchangeTransaction)
            //       .HasForeignKey(e => e.UserID);

            //builder.HasOne(e => e.BlockchainEvent)
            //       .WithMany(b => b.ExchangeTransaction)
            //       .HasForeignKey(e => e.BlockchainEventEventId);
        }
    }
}
