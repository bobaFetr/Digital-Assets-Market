using System.ComponentModel.DataAnnotations;
//using DAM;
using ExchangeTransactionTableNameSpace;

namespace BLockchainEventTableNameSpace
{
    public class BlockchainEvent
    {
        [Key]
        public int EventId { get; set; }
        public string TxHash { get; set; }
        public string EventType { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get; set; }

        public ICollection<ExchangeTransaction> ExchangeTransaction { get; set; }
    }

}
