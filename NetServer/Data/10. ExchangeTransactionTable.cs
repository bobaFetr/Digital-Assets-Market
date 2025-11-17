namespace DAM
{
    public class ExchangeTransaction
    {
        [Key]
        public int TransactionID { get; set; }
        [ForeignKey("User")]
        public int UserID { get; set; }
        public string TypeOfTransaction { get; set; }
        public string Currency { get; set; }

        public decimal Amount { get; set; }
        public string Status { get; set; }

        
        public string BlockchainTransactionHash { get; set; }

        public DateTime TimeStamp { get; set; }
        

        public User User { get; set; }
        [ForeignKey("BlockchainEvent")]
        public int BlockchainEventEventId { get; set; }
        public BlockchainEvent BlockchainEvent { get; set; }
    }
}
