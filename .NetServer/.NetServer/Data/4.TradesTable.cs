using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrdersTablenamepsace.Data;

namespace TradesTableNameSpace
{
    public class TradesTable
    {
        [Key]
        public int TradeId { get; set; }

        public int BuyOrderId { get; set; }
        public OrdersTable BuyOrder { get; set; }

        public int SellOrderId { get; set; }
        public OrdersTable SellOrder { get; set; }

        public decimal Price { get; set; }
        public double Amount { get; set; }
        public double timestamp { get; set; }
    }

}