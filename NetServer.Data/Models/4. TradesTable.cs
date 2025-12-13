using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class TradesTable
    {
        public TradesTable()
        {
            TradeId = Guid.NewGuid();
            BuyOrderId = Guid.NewGuid();
            SellOrder = null!;
            BuyOrder = null!;
            Price = 0.0m;
            Amount = 0.0;
            TimeStamp = DateTime.UtcNow;
        }
        public TradesTable(Guid tradeId, DateTime timeStamp)
        {
            TradeId = tradeId;
            TimeStamp = timeStamp;
        }

        [Key]
        public Guid TradeId { get; set; }
        [Required]

        public Guid BuyOrderId { get; set; }

        
        public OrderBook SellOrder { get; set; }

        public OrderBook BuyOrder { get; set; }

        public decimal Price { get; set; }
        public double Amount { get; set; }
        public DateTime TimeStamp { get; set; }
    }

}