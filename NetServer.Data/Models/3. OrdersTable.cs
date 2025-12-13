using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public enum OrderType
    {
        Buy,
        Sell
    }
    public enum OrderStatus
    {
        Open,
        Filled,
        Cancelled
    }
    public class OrdersTable
    {
        public OrdersTable()
        {
            OrderId = Guid.NewGuid();
            UserId = Guid.NewGuid();
            TypeOfOrder = OrderType.Buy;
            Symbol = string.Empty;
            Price = 0.0m;
            Amount = 0.0m;
            OrderStatus = OrderStatus.Open;
            CreatedAt = DateTime.UtcNow;
        }
        public OrdersTable(Guid orderId, DateTime createdAt)
        {
            OrderId = orderId;
            CreatedAt = createdAt;
            TradesAsBuyOrder = new HashSet<TradesTable>();
            TradesAsSellOrder = new HashSet<TradesTable>();
        }
        [Key]
        public Guid OrderId { get; set; }

        public Guid UserId  { get; set; }

        public OrderType TypeOfOrder { get; set; }

        public string Symbol { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public decimal Amount { get; set; }

        public OrderStatus OrderStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        

        public User User { get; set; }
        public ICollection<TradesTable> TradesAsBuyOrder { get; set; }
        public ICollection<TradesTable> TradesAsSellOrder { get; set; }

        
    }
}
