using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Configurations
{
    public class OrdersConfiguration : IEntityTypeConfiguration<OrdersTable>
    {
        public void Configure(EntityTypeBuilder<OrdersTable> builder)
        {
            builder.HasData(OrdersSeeding.GenerateOrders());

            // Primary key
            builder.HasKey(o => o.OrderId);

            // Relationship: Order → User
            builder.HasOne(o => o.User)
                   .WithMany(u => u.Orders)
                   .HasForeignKey(o => o.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Relationship: Trades as Buy Order
            builder.HasMany(o => o.TradesAsBuyOrder)
                   .WithOne() // No navigation property for BuyOrder in TradesTable
                   .HasForeignKey(t => t.BuyOrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            

            
        }
    }
}
