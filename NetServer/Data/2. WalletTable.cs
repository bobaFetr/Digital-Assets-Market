using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using UserNameSpace.Data;

namespace WalletTableNameSpace
{
    public class WalletTable
    {
        [Key]
        public int  WalletID     { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public string Currency { get; set; }
        public decimal Balance { get; set; }
        public string Addres { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        

        public User User { get; set; }
    }
}
