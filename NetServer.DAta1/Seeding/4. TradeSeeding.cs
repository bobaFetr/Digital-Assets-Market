using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
namespace NetServer.Data.Seeding
{
    public static class TradeSeeding
    {
        public static ICollection<TradesTable> GenerateTrades()
        {
            var trades = new HashSet<TradesTable>();
            trades.Add(new TradesTable
            {
                TradeId = DataSeedingConstants.TradeConstants.Trade1Id,
                BuyOrderId = DataSeedingConstants.TradeConstants.BuyOrderId1,
                SellOrderId = null, // explicitly null to avoid FK conflict
                Price = DataSeedingConstants.TradeConstants.Price1,
                Amount = DataSeedingConstants.TradeConstants.Amount1,
                TimeStamp = DataSeedingConstants.TradeConstants.TimeStamp1
            });

            return trades;
        }
    }
}