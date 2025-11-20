using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class ReferralSeeding
    {
        public static ICollection<Referral> GenerateReferrals()
        {
            var referral = new HashSet<Referral>();
            referral.Add(new Referral
            {
                ReferralId = Guid.NewGuid(),
                ReferrerId = Guid.NewGuid(),
                ReferredId = Guid.NewGuid(),
                BonusAmount = 25.00m,
                Timestamp = DateTime.UtcNow
            });
            return referral;
        }
    }
}
