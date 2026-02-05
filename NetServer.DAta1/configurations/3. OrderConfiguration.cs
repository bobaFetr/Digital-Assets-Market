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
    public class OrderConfiguration : IEntityTypeConfiguration<OrdersTable>
    {
        public void Configure(EntityTypeBuilder<OrdersTable> builder)
        {
            builder.HasKey(o => o.OrderId);
            builder.HasData(OrderSeeding.GenerateOrders());
        }
    }
}