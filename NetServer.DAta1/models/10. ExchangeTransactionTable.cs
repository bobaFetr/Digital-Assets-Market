using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class ExchangeTransaction
    {
        [Key]
        public Guid TransactionID { get; set; }

        [ForeignKey("User")]
        public Guid UserID { get; set; }
        public string TypeOfTransaction { get; set; }
        public string Currency { get; set; }

        public decimal Amount { get; set; }
        public string Status { get; set; }

        
        public string BlockchainTransactionHash { get; set; }

        public DateTime TimeStamp { get; set; }
    }
}