using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
namespace NetServer.Data.Seeding
{
    public static class UserSeeding //: IEntityTypeConfiguration<User>
    {
        public static ICollection<User> GenerateUsers()
        {
            var users = new HashSet<User>();

            users.Add(new User
            {
                // Id = Guid.NewGuid(),
                // UserName = new string(""),
                // Email = new string(""),
                // PasswordHash = new string(""),
                // CreatedAt = new DateTime(),
                // Status = 0
                Id = DataSeedingConstants.UserConstants.User1Id,
                UserName = DataSeedingConstants.UserConstants.Username1,
                Email = DataSeedingConstants.UserConstants.Email,
                PasswordHash = DataSeedingConstants.UserConstants.Password,
                CreatedAt = DataSeedingConstants.UserConstants.CreatedAt1,
                Status = DataSeedingConstants.UserConstants.Status1,
                IsBanned = DataSeedingConstants.UserConstants.IsBanned1
            });
            return users;
        }
    }
}