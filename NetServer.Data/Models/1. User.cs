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
        [Key]
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public StatusBit Status { get; set; } = StatusBit.Active;
        public enum StatusBit
        {
            Inactive = 0,//place this in the enum folder
            Active = 1
        }



        public ICollection<WalletTable> Wallets { get; set; } = new List<WalletTable>();
        public ICollection<OrdersTable> Orders { get; set; }
        public ICollection<SessionTable> Sessions { get; set; }
        public ICollection<KycDocument> KycDocuments { get; set; }
        public ICollection<AuditLog> AuditLogs { get; set; }
        public ICollection<ExchangeTransaction> ExchangeTransaction { get; set; }

        public ICollection<Referral> ReferralsMade { get; set; }
        public ICollection<Referral> ReferralsReceived { get; set; }
    }
}
