using Microsoft.EntityFrameworkCore;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System.Reflection;
using NetServer.Data.Configurations;

namespace NetServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<WalletTable> Wallets { get; set; } = null!;

        public DbSet<OrdersTable> Orders { get; set; } = null!;
        public DbSet<TradesTable> TradesTable { get; set; } = null!;
        public DbSet<OrderBook> OrderBookTable { get; set; } = null!;

        public DbSet<KycDocument> KycDocuments { get; set; } = null!;
        public DbSet<SessionTable> Sessions { get; set; } = null!;

        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        // public DbSet<OrdersTable> OrdersTable { get; set; } = null!;
        
        
        
        
        // public DbSet<BlockchainEvent> BlockchainEvents { get; set; } = null!;
        public DbSet<ExchangeTransaction> Transactions { get; set; } = null!;
        public DbSet<BlockchainEvent> BlockchainEvents { get; set; } = null!;
        public DbSet<FeeTable> FeeTables { get; set; } = null!;
        public DbSet<Referral> Referrals { get; set; } = null!;

        public DbSet<FAQ> FAQs { get; set; } = null!;
        // public DbSet<ChatTable> Messages { get; set; } = null!;
        // public DbSet<NewsTable> News { get; set; } = null!;
         

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // Apply IEntityTypeConfiguration<T> implementations
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            

            modelBuilder.Entity<User>().HasKey(u => u.Id);
            modelBuilder.Entity<WalletTable>().HasKey(w => w.WalletID);
            modelBuilder.Entity<OrdersTable>().HasKey(o => o.OrderId);
            modelBuilder.Entity<TradesTable>().HasKey(t => t.TradeId);
            modelBuilder.Entity<OrderBook>().HasKey(ob => ob.OrderId);
            modelBuilder.Entity<KycDocument>().HasKey(k => k.DocId);
            modelBuilder.Entity<SessionTable>().HasKey(s => s.SessionId);
            modelBuilder.Entity<AuditLog>().HasKey(a => a.LogId);
            modelBuilder.Entity<BlockchainEvent>().HasKey(b => b.EventId);
            modelBuilder.Entity<ExchangeTransaction>().HasKey(et => et.TransactionID);
            modelBuilder.Entity<FeeTable>().HasKey(f => f.FeeTableId);
            // modelBuilder.Entity<WalletTable>().HasKey(w => w.WalletID);
            // modelBuilder.Entity<KycDocument>().HasKey(k => k.DocId);
            // modelBuilder.Entity<AuditLog>().HasKey(a => a.LogId);
            // modelBuilder.Entity<Fee>().HasKey(f => f.FeeId);

            // // Relationships
           

            modelBuilder.Entity<User>()
                .HasMany<WalletTable>()
                .WithOne()
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<WalletTable>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrdersTable>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            ///////////////////////////////////////////
            modelBuilder.Entity<TradesTable>()
            .HasOne(t => t.BuyOrder)
            .WithMany()
            .HasForeignKey(t => t.BuyOrderId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TradesTable>()
            .HasOne(t => t.SellOrder)
            .WithMany()
            .HasForeignKey(t => t.SellOrderId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderBook>()
            .HasOne(ob => ob.Order)
            .WithOne(o => o.OrderBook)
            .HasForeignKey<OrderBook>(ob => ob.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

            

            modelBuilder.Entity<KycDocument>()
            .HasOne(k => k.User)
            .WithMany()
            .HasForeignKey(k => k.UserId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SessionTable>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BlockchainEvent>()
            .HasOne(b => b.ExchangeTransaction)
            .WithMany()
            .HasForeignKey(b => b.ExchangeTransactionId)
            .OnDelete(DeleteBehavior.Cascade);
            
             

             modelBuilder.Entity<OrdersTable>()
                .HasOne(o => o.FeeTable)
                .WithMany(f => f.Orders)
                .HasForeignKey(o => o.FeeTableId)
                .OnDelete(DeleteBehavior.Restrict);


             modelBuilder.Entity<FAQ>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(f => f.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NewsTable>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(n => n.Author)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<NewsTable>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(n => n.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<NewsTable>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(n => n.EditedBy)
                .OnDelete(DeleteBehavior.Restrict);
                //updated, deleted

                modelBuilder.Entity<NewsTable>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(n => n.DeletedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // UpdatedAt and PublishedAt are timestamps, not user foreign keys.

                
            // modelBuilder.Entity<TradesTable>()
            //     .HasOne(t => t.BuyOrder)
            //     .WithMany(o => o.TradesAsBuyOrder)
            //     .HasForeignKey(t => t.BuyOrderId)
            //     .OnDelete(DeleteBehavior.Restrict);

            // modelBuilder.Entity<TradesTable>()
            //     .HasOne(t => t.SellOrder)
            //     .WithMany(o => o.TradesAsSellOrder)
            //     .HasForeignKey("SellOrderId")
            //     .OnDelete(DeleteBehavior.Restrict);

            // modelBuilder.Entity<Referral>()
            //     .HasOne(r => r.Referrer)
            //     .WithMany(u => u.ReferralsMade)
            //     .HasForeignKey(r => r.ReferrerId)
            //     .OnDelete(DeleteBehavior.Restrict);

            // modelBuilder.Entity<Referral>()
            //     .HasOne(r => r.Referred)
            //     .WithMany(u => u.ReferralsReceived)
            //     .HasForeignKey(r => r.ReferredId)
            //     .OnDelete(DeleteBehavior.Restrict);

            // modelBuilder.Entity<ChatTable>()
            // .HasOne(c => c.Sender)
            // .WithMany()
            // .HasForeignKey(c => c.SenderId)
            // .OnDelete(DeleteBehavior.Restrict);   // prevent cascade

            // modelBuilder.Entity<ChatTable>()
            //     .HasOne(c => c.Receiver)
            //     .WithMany()
            //     .HasForeignKey(c => c.ReceiverId)
            //     .OnDelete(DeleteBehavior.Restrict);   // prevent cascade


            // modelBuilder.Entity<NewsTable>()
            //     .HasKey(n => n.NewsId);

            // modelBuilder.Entity<FAQTable>()
            //     .HasKey(f => f.FaqId);

            //modelBuilder.ApplyConfiguration(new UserSeeding());
            //modelBuilder.ApplyConfiguration(new UserSeeding());
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //optionsBuilder.EnableSensitiveDataLogging();
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.EnableSensitiveDataLogging();
            }
        }
    }
}