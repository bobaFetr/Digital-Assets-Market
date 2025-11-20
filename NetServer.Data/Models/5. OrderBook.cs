using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class OrderBook
    {
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
