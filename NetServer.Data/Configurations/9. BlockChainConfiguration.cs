using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class BlockChainConfiguration
    {
        public void Configure(EntityTypeBuilder<BlockchainEvent> builder)
        {
            builder.HasKey(b => b.EventId);

            builder.HasData(BlockChainEventSeeding.BlockChainEvents());

            //builder.HasMany(b => b.ExchangeTransaction)
            //       .WithOne(e => e.BlockchainEvent)
            //       .HasForeignKey(e => e.BlockchainEventEventId);
        }
    }
}
