using System.ComponentModel.DataAnnotations;
namespace NetServer.Data.Models
{
    public class Fee
    {
        public Fee()
        {
            FeeId = Guid.NewGuid();
            Symbol = string.Empty;
            MakerFee = 0.0m;
            TakerFee = 0.0m;
            UpdatedAt = DateTime.UtcNow;
        }
        public Fee(Guid feeId, DateTime updatedAt) 
        { 
            FeeId = feeId;
            UpdatedAt = updatedAt;
        }
        [Key]
        public Guid FeeId { get; set; }
        public string Symbol { get; set; }
        public decimal MakerFee { get; set; }
        public decimal TakerFee { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

}