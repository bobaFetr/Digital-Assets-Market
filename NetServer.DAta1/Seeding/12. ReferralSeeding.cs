using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
using System.Collections.Generic;
using System;

namespace NetServer.Data.Seeding
{
    public static class ReferralSeeding
    {
        public static IEnumerable<Referral> GenerateReferrals()
        {
            var referrals = new HashSet<Referral>();
            referrals.Add(new Referral
            {
                ReferralId = DataSeedingConstants.ReferralConstants.Referral1Id,
                ReferrerId = DataSeedingConstants.ReferralConstants.ReferrerId,
                ReferredId = DataSeedingConstants.ReferralConstants.ReferredId,
                BonusAmount = DataSeedingConstants.ReferralConstants.BonusAmount1,
                Timestamp = DataSeedingConstants.ReferralConstants.Timestamp1
            });
            return referrals;
        }
    }
}