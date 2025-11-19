using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class TradesSeeding
    {
        public static ICollection<TradesTable> GenerateTrades()
        {
            var trades = new HashSet<TradesTable>();
            trades.Add(new TradesTable
            {
                TradeId = Guid.NewGuid(),
                BuyOrderId = Guid.NewGuid(),
                Price = 51000.0m,
                Amount = 0.05,
                TimeStamp = DateTime.Now,
            });
            return trades;
        }
    }
}
