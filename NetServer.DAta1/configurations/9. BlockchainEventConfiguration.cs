using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;

namespace NetServer.Data.Configurations
{
    public class BlockchainEventConfiguration : IEntityTypeConfiguration<BlockchainEvent>
    {
        public void Configure(EntityTypeBuilder<BlockchainEvent> builder)
        {
            builder.HasKey(x => x.EventId);
            builder.HasData(BlockchainEventSeeding.GenerateBlockchainEvents());
        }
    }
}
