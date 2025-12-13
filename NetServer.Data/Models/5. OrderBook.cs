using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class OrderBook
    {
        public OrderBook()
        {
            OrderBookId = Guid.NewGuid();
            Symbol = string.Empty;
            Price = 0.0m;
            Amount = 0.0m;
            Timestamp = DateTime.UtcNow;
            TradesAsBuyOrder = new HashSet<TradesTable>();
            TradesAsSellOrder = new HashSet<TradesTable>();
        }
        public OrderBook(Guid orderBookId, DateTime timestamp)
        {
            OrderBookId = orderBookId;
            Timestamp = timestamp;
            TradesAsBuyOrder = new HashSet<TradesTable>();
            TradesAsSellOrder = new HashSet<TradesTable>();
        }
        [Key]
        public Guid OrderBookId { get; set; } // Primary key
        public string Symbol { get; set; }
        public decimal Price { get; set; }
        public decimal Amount { get; set; }
        public DateTime Timestamp { get; set; }

        public ICollection<TradesTable> TradesAsBuyOrder { get; set; }
        public ICollection<TradesTable> TradesAsSellOrder { get; set; }


        
    }
}
