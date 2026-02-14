using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class BlockchainEvent
    {
        [Key]
        public Guid EventId { get; set; }
        [Required]
        public Guid ExchangeTransactionId { get; set; }
        public ExchangeTransaction ExchangeTransaction { get; set; }
        public string TxHash { get; set; }
        public string EventType { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get; set; }
    }
}