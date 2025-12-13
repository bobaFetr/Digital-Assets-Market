using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class BlockchainEvent
    {
        public BlockchainEvent()
        {
            EventId = Guid.NewGuid();
            TxHash = string.Empty;
            EventType = string.Empty;
            Status = string.Empty;
            Timestamp = DateTime.UtcNow;
        }
        public BlockchainEvent(Guid eventId, DateTime timestamp) 
        { 
            EventId = eventId;
            ExchangeTransaction = new HashSet<ExchangeTransaction>();
            Timestamp = timestamp;
        }
        [Key]
        public Guid EventId { get; set; }
        public string TxHash { get; set; }
        public string EventType { get; set; }
        public string Status { get; set; }
        public DateTime Timestamp { get; set; }

        public ICollection<ExchangeTransaction> ExchangeTransaction { get; set; }

        public static implicit operator BlockchainEvent(HashSet<BlockchainEvent> v)
        {
            throw new NotImplementedException();
        }
    }

}
    