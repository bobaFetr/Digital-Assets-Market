using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class CreditCardDetailsTable
    {
        [Key]
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public string CardHolderName { get; set; } = string.Empty;
        public string CardLast4 { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string Currency { get; set; } = "USD";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public User? User { get; set; }
    }
}