using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class TradesConfiguration
    {
        public void Configure(EntityTypeBuilder<TradesTable> builder)
        {
            builder.HasData(TradesSeeding.GenerateTrades());

            // Primary key       
            // Primary key
            builder.HasKey(t => t.TradeId);

            // Relationship: Trade → BuyOrder
            builder.HasOne(t => t.BuyOrder)
                   .WithMany(o => o.TradesAsBuyOrder)   // collection in OrdersTable
                   .HasForeignKey(t => t.BuyOrderId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Relationship: Trade → SellOrder
            builder.HasOne(t => t.SellOrder)
                   .WithMany(o => o.TradesAsSellOrder)  // collection in OrdersTable
                   .HasForeignKey(t => t.BuyOrderId)
                   .OnDelete(DeleteBehavior.Restrict);

            
        }
    }
}
