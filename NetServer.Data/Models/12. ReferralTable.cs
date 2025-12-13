using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class Referral
    {
        public Referral()
        {
            ReferralId = Guid.NewGuid();
            ReferrerId = Guid.NewGuid();
            ReferredId = Guid.NewGuid();
            BonusAmount = 0.0m;
            Timestamp = DateTime.UtcNow;
        }
        public Referral(Guid referralId, DateTime timestamp) 
        { 
            ReferralId = referralId;
            Timestamp = timestamp;
        }
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
