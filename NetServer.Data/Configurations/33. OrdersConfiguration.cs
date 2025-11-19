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
                   .WithOne(t => t.BuyOrderId)          // navigation in TradesTable
                   .HasForeignKey(t => t.BuyOrderId)  // FK in TradesTable
                   .OnDelete(DeleteBehavior.Cascade);

            // Relationship: Trades as Sell Order
            builder.HasMany(o => o.TradesAsSellOrder)
                   .WithOne(t => t.SellOrder)         // navigation in TradesTable
                   .HasForeignKey(t => t.SellOrderId) // FK in TradesTable
                   .OnDelete(DeleteBehavior.Cascade);

            // Property configurations
            builder.Property(o => o.Symbol)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(o => o.Price)
                   .HasColumnType("decimal(18,2)");

            builder.Property(o => o.Amount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(o => o.CreatedAt)
                   .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
