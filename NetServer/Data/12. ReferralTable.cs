using UserNameSpace.Data;
using System.ComponentModel.DataAnnotations;
namespace ReferralTableNameSpace
{
    public class Referral
    {
        [Key]
        public int ReferralId { get; set; }
        public int ReferrerId { get; set; }
        public int ReferredId { get; set; }
        public decimal BonusAmount { get; set; }
        public DateTime Timestamp { get; set; }

        public User Referrer { get; set; }
        public User Referred { get; set; }


        
    }
}
