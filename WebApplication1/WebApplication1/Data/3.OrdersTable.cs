using System.ComponentModel.DataAnnotations;
using TradesTableNameSpace;
using UserNameSpace.Data;

namespace OrdersTablenamepsace.Data
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
        [Key]
        public int Order_Id { get; set; }

        public int  UserId  { get; set; }

        public OrderType Type_Of_Order { get; set; }

        public string symbol { get; set; } = string.Empty;

        public decimal Price { get; set; }
        public decimal Amount { get; set; }

        public OrderStatus Order_Status { get; set; }
        public DateTime created_at { get; set; }
        

        public User User { get; set; }
        public ICollection<TradesTable> TradesAsBuyOrder { get; set; }
        public ICollection<TradesTable> TradesAsSellOrder { get; set; }

        
    }
}