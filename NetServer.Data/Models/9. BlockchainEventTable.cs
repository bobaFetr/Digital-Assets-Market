using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class BlockchainEvent
    {
        [Key]
        public Guid EventId { get; set; }
        public string TxHash { get; set; }
        public string EventType { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get; set; }

        public ICollection<ExchangeTransaction> ExchangeTransaction { get; set; }
    }

}
