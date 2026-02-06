using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace NetServer.Data.Models
{
    public class TradesTable
    {
        [Key]
        public Guid TradeId { get; set; }

        public Guid BuyOrderId { get; set; }
        public Guid? SellOrderId { get; set; }  // made nullable

        [ForeignKey(nameof(SellOrderId))]
        public OrdersTable? SellOrder { get; set; } = null!; // nullable nav

        [ForeignKey(nameof(BuyOrderId))]
        public OrdersTable BuyOrder { get; set; } = null!;

        public decimal Price { get; set; }
        public double Amount { get; set; }
        public DateTime TimeStamp { get; set; }
    }
}