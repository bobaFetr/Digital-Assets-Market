using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    }
}