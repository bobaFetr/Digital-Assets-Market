using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class Referral
    {
        [Key]
        public Guid ReferralId { get; set; }
        public Guid ReferrerId { get; set; }
        public Guid ReferredId { get; set; }
        public decimal BonusAmount { get; set; }
        public DateTime Timestamp { get; set; }

        public User Referrer { get; set; }
        public User Referred { get; set; }
    }
}
