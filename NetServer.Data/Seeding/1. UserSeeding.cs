using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;

namespace NetServer.Data.Seeding
{
    public class UserSeeding : IEntityTypeConfiguration<User>
    {
        //public void Configure(EntityTypeBuilder<User> builder)
        //{
        //    builder.HasData(GenerateUSers());

        //    builder.HasMany(u => u.Wallets)
        //           .WithOne(w => w.User)
        //           .HasForeignKey(w => w.UserId)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.Orders)
        //           .WithOne(o => o.User)
        //           .HasForeignKey(o => o.UserId)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.Sessions)
        //           .WithOne(s => s.User)
        //           .HasForeignKey(s => s.UserId)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.KycDocuments)
        //           .WithOne(k => k.User)
        //           .HasForeignKey(k => k.UserId)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.AuditLogs)
        //           .WithOne(a => a.User)
        //           .HasForeignKey(a => a.UserId)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.ExchangeTransaction)
        //           .WithOne(e => e.User)
        //           .HasForeignKey(e => e.UserID)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.ReferralsMade)
        //           .WithOne(r => r.Referrer)
        //           .HasForeignKey(r => r.ReferrerId)
        //           .OnDelete(DeleteBehavior.Cascade);

        //    builder.HasMany(u => u.ReferralsReceived)
        //           .WithOne(r => r.Referred)
        //           .HasForeignKey(r => r.ReferredId)
        //           .OnDelete(DeleteBehavior.Cascade);
        //}

        private static User GenerateUSers()
        {

            User user = new User
            {
                Id = DataSeedingConstants.UserConstants.User2Id,
                UserName = "Аlice",
                Email = "",//email and password should be crypted
                PasswordHash = "hashed_password_1",
                CreatedAt = new DateTime(2025, 11, 28),
                Status = 0// must be type bit
            };
            //more properties
            //created by, modified on, modified by, deletd by, 
            // Every user will have the same password for convenience
            //asp. net core identity package
            //var hasher = new PasswordHasher<User>();
            var hasher = new PasswordHasher<User>();

            user.PasswordHash = hasher.HashPassword(user, "12h444hHndndHJ");  //the hash iss changing every time

            return user;
        }


    }
}