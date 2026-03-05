using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;

namespace NetServer.Data.Configurations
{
    public class ExchangeTransactionConfiguration : IEntityTypeConfiguration<ExchangeTransaction>
    {
        public void Configure(EntityTypeBuilder<ExchangeTransaction> builder)
        {
            builder.HasKey(x => x.TransactionID);
            
            // Explicitly map primary key column if necessary or let EF decide
            // builder.Property(x => x.TransactionID).ValueGeneratedOnAdd(); 

            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(x => x.UserID)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.HasData(ExchangeTransactionSeeding.GenerateExchangeTransactions());
        }
    }
}
