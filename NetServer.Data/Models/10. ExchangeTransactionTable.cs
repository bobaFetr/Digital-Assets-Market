using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class ExchangeTransaction
    {
        public ExchangeTransaction()
        {
            TransactionID = Guid.NewGuid();
            UserID = Guid.NewGuid();
            TypeOfTransaction = string.Empty;
            Currency = string.Empty;
            Amount = 0.0m;
            Status = string.Empty;
            BlockchainTransactionHash = string.Empty;
        }
        public ExchangeTransaction(Guid transactionId, Guid userId, DateTime timeStamp)
        { 
            TransactionID = transactionId;
            UserID = userId;
            BlockchainEvent = new HashSet<BlockchainEvent>();
            TimeStamp = timeStamp;
        }
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
        

        public User User { get; set; }
        [ForeignKey("BlockchainEvent")]
        public Guid BlockchainEventEventId { get; set; }
        public BlockchainEvent BlockchainEvent { get; set; }
    }
}
