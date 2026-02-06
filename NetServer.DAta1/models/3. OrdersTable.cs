using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        [Key]
    public Guid OrderId { get; set; }

    public Guid UserId { get; set; }

    public OrderType TypeOfOrder { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Amount { get; set; }
    public OrderStatus OrderStatus { get; set; }
    public DateTime CreatedAt { get; set; }

    public OrderBook OrderBook { get; set; } = null!;
    }
}
