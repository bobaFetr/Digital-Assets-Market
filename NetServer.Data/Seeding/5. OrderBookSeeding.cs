using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static  class OrderBookSeeding
    {
        public static ICollection<OrderBook> GenerateTrades()
        {
            var orderBooks = new HashSet<OrderBook>();
            orderBooks.Add(new OrderBook
            {
                OrderBookId = Guid.NewGuid(),
                Symbol = "BTCUSD",
                Price = 50000.0m,
                Amount = 0.1m,
                Timestamp = DateTime.UtcNow
            });
            return orderBooks;
        }
    }
}
