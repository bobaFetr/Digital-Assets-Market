using System.Reflection;
using System.Security.Cryptography.Xml;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using NetServer.Data.Models;
using NetServer.Data.Configurations;
namespace NetServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // DbSets
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<WalletTable> Wallets { get; set; } = null!;
        public DbSet<OrdersTable> OrdersTable { get; set; } = null!;
        public DbSet<TradesTable> TradesTable { get; set; } = null!;
        public DbSet<OrderBook> OrderBookTable { get; set; } = null!;
        public DbSet<KycDocument> KycDocuments { get; set; } = null!;
        public DbSet<SessionTable> Sessions { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<BlockchainEvent> BlockchainEvents { get; set; } = null!;
        public DbSet<ExchangeTransaction> Transactions { get; set; } = null!;
        public DbSet<Fee> Fees { get; set; } = null!;
        public DbSet<Referral> Referrals { get; set; } = null!;
        public DbSet<ChatTable> Messages { get; set; } = null!;
        public DbSet<NewsTable> News { get; set; } = null!;
        public DbSet<FAQTable> FAQs { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply IEntityTypeConfiguration<T> implementations
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Example explicit keys
            modelBuilder.Entity<KycDocument>().HasKey(k => k.DocId);
            modelBuilder.Entity<AuditLog>().HasKey(a => a.LogId);
            modelBuilder.Entity<Fee>().HasKey(f => f.FeeId);

            // Relationships
            modelBuilder.Entity<OrdersTable>()
                .HasMany(o => o.TradesAsBuyOrder)
                .WithOne(t => t.BuyOrder)
                .HasForeignKey(t => t.BuyOrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TradesTable>()
                .HasOne(t => t.BuyOrder)
                .WithMany(o => o.TradesAsBuyOrder)
                .HasForeignKey(t => t.BuyOrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TradesTable>()
                .HasOne(t => t.SellOrder)
                .WithMany(o => o.TradesAsSellOrder)
                .HasForeignKey(t => t.SellOrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Referral>()
                .HasOne(r => r.Referrer)
                .WithMany(u => u.ReferralsMade)
                .HasForeignKey(r => r.ReferrerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Referral>()
                .HasOne(r => r.Referred)
                .WithMany(u => u.ReferralsReceived)
                .HasForeignKey(r => r.ReferredId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatTable>()
            .HasOne(c => c.Sender)
            .WithMany()
            .HasForeignKey(c => c.SenderId)
            .OnDelete(DeleteBehavior.Restrict);   // prevent cascade

        modelBuilder.Entity<ChatTable>()
            .HasOne(c => c.Receiver)
            .WithMany()
            .HasForeignKey(c => c.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);   // prevent cascade


            modelBuilder.Entity<NewsTable>()
                .HasKey(n => n.NewsId);

            modelBuilder.Entity<FAQTable>()
                .HasKey(f => f.FaqId);

            modelBuilder.ApplyConfiguration(new UserConfiguration());
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=DamDb;Trusted_Connection=True;");
            }
        }
    }

    // Design-time factory
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var basePath = Directory.GetCurrentDirectory();
            var config = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = config.GetConnectionString("DefaultConnection")
                ?? "Server=(localdb)\\mssqllocaldb;Database=DamDb;Trusted_Connection=True;";

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}