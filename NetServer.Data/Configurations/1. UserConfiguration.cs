using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;

namespace NetServer.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        //private object modelBuilder;

        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasData(
                UserSeeding.GenerateUSers());


            //builder.HasMany(u => u.Wallets)
            //  .WithOne(w => w.User)
            //  .HasForeignKey(w => w.UserId)
            //  .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.Wallets)
                   .WithOne(w => w.User)
                   .HasForeignKey(w => w.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.Orders)
                   .WithOne(o => o.User)
                   .HasForeignKey(o => o.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.Sessions)
                   .WithOne(s => s.User)
                   .HasForeignKey(s => s.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.KycDocuments)
                   .WithOne(k => k.User)
                   .HasForeignKey(k => k.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.AuditLogs)
                   .WithOne(a => a.User)
                   .HasForeignKey(a => a.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.ExchangeTransaction)
                   .WithOne(e => e.User)
                   .HasForeignKey(e => e.UserID)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.ReferralsMade)
                   .WithOne(r => r.Referrer)
                   .HasForeignKey(r => r.ReferrerId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.ReferralsReceived)
                   .WithOne(r => r.Referred)
                   .HasForeignKey(r => r.ReferredId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
