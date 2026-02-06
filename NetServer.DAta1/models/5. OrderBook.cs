using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
    }
}