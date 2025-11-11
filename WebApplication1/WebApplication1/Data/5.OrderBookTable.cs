using System.ComponentModel.DataAnnotations;

namespace OrderBookTablenamepsace
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
    }

}