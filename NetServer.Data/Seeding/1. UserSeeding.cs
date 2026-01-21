using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;

namespace NetServer.Data.Seeding
{
    public static class UserSeeding //: IEntityTypeConfiguration<User>
    {
        public static ICollection<User> GenerateUsers()
        {
            var users = new HashSet<User>();

            users.Add(new User
            {
                Id = Guid.NewGuid(),
                UserName = new string(""),
                Email = new string(""),
                PasswordHash = new string(""),
                CreatedAt = new DateTime(),
                Status = 0
            });
            return users;
        }
    }
}