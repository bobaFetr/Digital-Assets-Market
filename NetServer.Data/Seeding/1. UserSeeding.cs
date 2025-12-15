using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;

namespace NetServer.Data.Seeding
{
    //IEntityTypeConfiguration<User>
    public class UserSeeding : IEntityTypeConfiguration<UserSeeding>
    {

        ICollection<User> users = = new HashSet<User>()
        {
            new User()
        };
        private static User GenerateUSers()
        {

            User user = new User
            {
                Id = DataSeedingConstants.UserConstants.User1Id,
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

        void IEntityTypeConfiguration<UserSeeding>.Configure(EntityTypeBuilder<UserSeeding> builder)
        {
            throw new NotImplementedException();
        }
    }
}