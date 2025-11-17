namespace UserNameSpace.Data
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Active";


         public ICollection<WalletTable> Wallets { get; set; }
        public ICollection<OrdersTable> Orders { get; set; }
        public ICollection<SessionTable> Sessions { get; set; }
        public ICollection<KycDocument> KycDocuments { get; set; }
        public ICollection<AuditLog> AuditLogs { get; set; }
        public ICollection<ExchangeTransaction> ExchangeTransaction { get; set; }

        public ICollection<Referral> ReferralsMade { get; set; }
        public ICollection<Referral> ReferralsReceived { get; set; }
    }
}
