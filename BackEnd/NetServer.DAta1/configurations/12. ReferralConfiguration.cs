using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;

namespace NetServer.Data.Configurations
{
    public class ReferralConfiguration : IEntityTypeConfiguration<Referral>
    {
        public void Configure(EntityTypeBuilder<Referral> builder)
        {
            builder.HasKey(x => x.ReferralId);
            builder.HasData(ReferralSeeding.GenerateReferrals());
        }
    }
}