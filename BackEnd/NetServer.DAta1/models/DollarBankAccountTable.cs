using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class DollarBankAccountTable
    {
        [Key]
        public Guid BankAccountId { get; set; }

        [ForeignKey("User")]
        public Guid UserId { get; set; }

        public string AccountHolderName { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string Iban { get; set; } = string.Empty;
        public string SwiftCode { get; set; } = string.Empty;
        public string Currency { get; set; } = "USD";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }
    }
}
