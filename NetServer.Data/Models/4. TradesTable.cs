using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class TradesTable
    {
        [Key]
        public Guid TradeId { get; set; }

        public Guid BuyOrderId { get; set; }

        
        public OrderBook SellOrder { get; set; }

        public OrderBook BuyOrder { get; set; }

        public decimal Price { get; set; }
        public double Amount { get; set; }
        public DateTime TimeStamp { get; set; }
    }

}
