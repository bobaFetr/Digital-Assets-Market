using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class OrdersSeeding
    {
        public static ICollection<OrdersTable> GenerateOrders()
        {
            var orders = new HashSet<OrdersTable>();
            orders.Add(new OrdersTable
            {
                OrderId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                TypeOfOrder = OrderType.Buy,
                Amount = 0.1m,
                Price = 50000.0m,
                OrderStatus = OrderStatus.Cancelled,
                CreatedAt = DateTime.UtcNow
            });
            return orders;
        }
    }
}
