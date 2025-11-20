using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class ReferalConfiguration
    {
        public void Configure(EntityTypeBuilder<Referral> builder)
        {
            //GenerateFees
            //GenerateReferrals
            builder.HasData(ReferralSeeding.GenerateReferrals());

            builder.HasKey(r => r.ReferralId);

            builder.HasOne(r => r.Referrer)
                   .WithMany(u => u.ReferralsMade)
                   .HasForeignKey(r => r.ReferrerId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Referred)
                   .WithMany(u => u.ReferralsReceived)
                   .HasForeignKey(r => r.ReferredId)
                   .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
