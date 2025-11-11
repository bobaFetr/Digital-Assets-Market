namespace NetServer.DB_Context
{
    using KycDocumentTableNameSpace;
    using AuditLogTableNameSpace;
    using FeeTableNameSpace;
    using Microsoft.EntityFrameworkCore;
    using UserNameSpace.Data;
    using WalletTableNameSpace;
    using OrdersTablenamepsace.Data;
    using TradesTableNameSpace;
    using OrderBookTablenamepsace;
    using SessionTableNameSpace;
    using BlockchainEventtablenNameSpace;
    using ExchangeTransactionNameSpace;
    using ReferralTable;

    public class DB_COntext : DbContext
    {
        public DB_COntext(DbContextOptions<DB_COntext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<WalletTable> Wallets { get; set; }

        public DbSet<OrdersTable> OrdersTable { get; set; }
        public DbSet<TradesTable> TradesTable { get; set; }
        public DbSet<OrderBook> OrderBookTable { get; set; }
        public DbSet<KycDocument> KycDocumenTable { get; set; }
        public DbSet<SessionTable> SessionTable { get; set; }
        public DbSet<AuditLog> AuditLogTable { get; set; }

        public DbSet<BlockchainEvent> BlockchainEventtable { get; set; }
        public DbSet<ExchangeTransaction> TransactionsTable { get; set; }
        public DbSet<Fee> FeesTable { get; set; }
        public DbSet<Referral> ReferralsTable { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<KycDocument>()
                .HasKey(k => k.DocId);

            modelBuilder.Entity<AuditLog>()
                .HasKey(a => a.LogId);

            modelBuilder.Entity<Fee>()
                .HasKey(f => f.FeeId);
        }
    }
}