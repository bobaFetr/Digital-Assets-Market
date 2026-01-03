using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class WalletTable
    {
        public WalletTable()
        { 
            WalletID = Guid.NewGuid();
            UserId = Guid.NewGuid();
            Currency = string.Empty;
            Balance = 0.0m;
            Addres = string.Empty;
            Status = string.Empty;
            CreatedAt = DateTime.UtcNow;
        }
        public WalletTable(Guid id, DateTime createdOn) 
        { 
            WalletID = id;
            Wallets = new HashSet<WalletTable>();
            CreatedAt = createdOn;
        }

        public WalletTable(string wallet1Id, string user1Id, DateTime createdOn)
        {
        }

        [Key]
        public Guid  WalletID     { get; set; }
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public string Addres { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<WalletTable> Wallets { get; set; }

        public User User { get; set; }
    }
}
