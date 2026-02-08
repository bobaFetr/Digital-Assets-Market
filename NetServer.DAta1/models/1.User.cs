using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
//using EntityFrameworkCore;
//Annotations;
//using UserNameSpace.Data.RelatedTables;
namespace NetServer.Data.Models
{
    public class User
    {
        public User()
        {
            Id = Guid.NewGuid();
            UserName = string.Empty;
            Password = string.Empty;
            Email = string.Empty;
            CreatedAt = DateTime.UtcNow;
            Status = 0;
        }
        public User(Guid id, DateTime createdAt)
        {
            Id = id;
            // Wallets = new HashSet<WalletTable>();
            // Orders = new HashSet<OrdersTable>();
            // Sessions = new HashSet<SessionTable>();
            // KycDocuments = new HashSet<KycDocument>();
            // AuditLogs = new HashSet<AuditLog>();
            // ExchangeTransaction = new HashSet<ExchangeTransaction>();
            // ReferralsMade = new HashSet<Referral>();
            // ReferralsReceived = new HashSet<Referral>();
            CreatedAt = createdAt;
        }
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public StatusBit Status { get; set; } = StatusBit.Active;
        public enum StatusBit
        {
            Inactive = 0,//place this in the enum folder
            Active = 1
        }

        public bool IsBanned { get; set; }
    }
}