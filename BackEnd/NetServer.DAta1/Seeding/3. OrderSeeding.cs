using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;

namespace NetServer.Data.Seeding
{
    public static class OrderSeeding //: IEntityTypeConfiguration<OrdersTable>
    {
        public static ICollection<OrdersTable> GenerateOrders()
        {
            var orders = new HashSet<OrdersTable>();
            orders.Add(new OrdersTable
            {
                OrderId = DataSeedingConstants.OrderConstants.Order1Id,
                UserId = DataSeedingConstants.OrderConstants.User1Id,
                TypeOfOrder = DataSeedingConstants.OrderConstants.OrderType1,
                Symbol = DataSeedingConstants.OrderConstants.Symbol1,
                Price = DataSeedingConstants.OrderConstants.Price1,
                Amount = DataSeedingConstants.OrderConstants.Amount1,
                OrderStatus = DataSeedingConstants.OrderConstants.OrderStatus1,
                CreatedAt = DataSeedingConstants.OrderConstants.TimeStamp1
            });
            return orders;
        }
    }
}