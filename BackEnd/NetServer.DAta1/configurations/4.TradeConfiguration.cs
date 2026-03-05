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
    public class TradeConfiguration : IEntityTypeConfiguration<TradesTable>
    {
        public void Configure(EntityTypeBuilder<TradesTable> builder)
        {
            builder.HasKey(t => t.TradeId);
            builder.HasData(TradeSeeding.GenerateTrades());
        }
    }
}