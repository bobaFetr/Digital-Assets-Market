using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BlockchainEventtablenNameSpace;
using UserNameSpace.Data;

namespace ExchangeTransactionNameSpace
{
    public class ExchangeTransaction
    {
        [Key]
        public int TransactionID { get; set; }
        [ForeignKey("User")]
        public Guid UserID { get; set; }
        public string TypeOfTransaction { get; set; }
        public string Currency { get; set; }

        public decimal Amount { get; set; }
        public string status { get; set; }

        
        public string BlockchainTransactionHash { get; set; }

        public DateTime TimeStamp { get; set; }
        

        public User User { get; set; }
        [ForeignKey("BlockchainEvent")]
        public Guid BlockchainEventEventId { get; set; }
        public BlockchainEvent BlockchainEvent { get; set; }
    }
}