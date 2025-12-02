using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class WalletTable
    {
        [Key]
        public Guid  WalletID     { get; set; }
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public string Addres { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        
        public User User { get; set; }
    }
}
