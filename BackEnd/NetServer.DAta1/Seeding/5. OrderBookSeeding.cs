using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;

namespace NetServer.Data.Seeding
{
    public static class OrderBookSeeding
    {
        public static ICollection<OrderBook> GenerateOrderBooks()
        {
            var orderBooks = new HashSet<OrderBook>();
            orderBooks.Add(new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                OrderId = DataSeedingConstants.OrderConstants.Order1Id, // reference valid Order
                Symbol = DataSeedingConstants.OrderConstants.Symbol1,
                Price = DataSeedingConstants.OrderConstants.Price1,
                Amount = DataSeedingConstants.OrderConstants.Amount1,
                Timestamp = DataSeedingConstants.OrderConstants.TimeStamp1
            });

            return orderBooks;
        }
    }
}