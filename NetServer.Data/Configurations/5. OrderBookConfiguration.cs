using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public class OrderBookConfiguration
    {
        public void Configure(EntityTypeBuilder<OrderBook> builder)
        {
            

            builder.HasKey(ob => ob.OrderBookId);

            builder.HasData(OrderBookSeeding.GenerateTrades());

            //// One OrderBook → Many Trades (Buy side)
            //builder.HasMany(ob => ob.TradesAsBuyOrder)
            //       .WithOne(t => t.BuyOrder)
            //       .HasForeignKey(t => t.BuyOrderId)
            //       .OnDelete(DeleteBehavior.Cascade);

            //// One OrderBook → Many Trades (Sell side)
            //builder.HasMany(ob => ob.TradesAsSellOrder)
            //       .WithOne(t => t.SellOrder)
            //       .HasForeignKey(t => t.SellOrder)
            //       .OnDelete(DeleteBehavior.Restrict);

        }
        
    }
}
