// using Microsoft.AspNetCore.Identity;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore.Metadata.Builders;
// using NetServer.Data.Models;
// using NetServer.Data.Seeding.Constants;

// namespace NetServer.Data.Seeding
// {
//     //IEntityTypeConfiguration<User>
//     public class UserSeeding : IEntityTypeConfiguration<UserSeeding>
//     {

//         ICollection<User> users = new HashSet<User>()
//         {
//             new User()
//         };
//         private static User GenerateUSers()
//         {

//             User user = new User
//             {
//                 //Id = DataSeedingConstants.UserConstants.User1Id,
//                 Id = new Guid(),
//                 UserName = "Аlice",
//                 Email = "",//email and password should be crypted
//                 PasswordHash = "hashed_password_1",
//                 CreatedAt = new DateTime(2025, 11, 28),
//                 Status = 0// must be type bit
//             };
//             //more properties
//             //created by, modified on, modified by, deletd by, 
//             // Every user will have the same password for convenience
//             //asp. net core identity package
//             //var hasher = new PasswordHasher<User>();
//             var hasher = new PasswordHasher<User>();

//             user.PasswordHash = hasher.HashPassword(user, "12h444hHndndHJ");  //the hash iss changing every time

//             return user;
//         }

//         void IEntityTypeConfiguration<UserSeeding>.Configure(EntityTypeBuilder<UserSeeding> builder)
//         {
//             throw new NotImplementedException();
//         }
//     }
// }

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;

namespace NetServer.Data.Seeding
{
    public class UserSeeding : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Precomputed password hash (example)
            // IMPORTANT: EF Core seeding requires deterministic values.
            // You must compute this hash ONCE and paste it here.
            var passwordHash = "AQAAAAEAACcQAAAAEJt0x8uV0..."; // replace with real hash

            builder.HasData(new User
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                UserName = "Alice",
                Email = "alice@example.com",
                PasswordHash = passwordHash,
                CreatedAt = new DateTime(2025, 11, 28),
                Status = User.StatusBit.Active,
                IsBanned = false
            });
        }
    }
}