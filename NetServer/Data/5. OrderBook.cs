using System.ComponentModel.DataAnnotations;
using TRadesTableNameSpace;

namespace OrderBookNameSpace
{
    public class OrderBook
    {
        [Key]
        public int Id { get; set; } // Primary key
        public string Symbol { get; set; }
        public string Side { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }

        public ICollection<TradesTable> TradesAsBuyOrder { get; set; }
        public ICollection<TradesTable> TradesAsSellOrder { get; set; }
    }
}
