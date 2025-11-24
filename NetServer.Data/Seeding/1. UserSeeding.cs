using Microsoft.AspNetCore.Identity;
using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;
using static NetServer.Data.Seeding.Constants.DataSeedingConstants.UserConstants;

namespace NetServer.Data.Seeding
{
    public static  class UserSeeding
    {
        public static ICollection<User> GenerateUSers() 
        { 
            var users = new HashSet<User>();

            users.Add(new User
            {
                Id = User1Id,
                UserName = "Аlice",
                Email = "",//email and password should be crypted
                PasswordHash = "hashed_password_1",
                CreatedAt = DateTime.UtcNow,
                Status = 0// must be type bit
                });
            //more properties
            //created by, modified on, modified by, deletd by, 
            // Every user will have the same password for convenience
            //asp. net core identity package
            //var hasher = new PasswordHasher<User>();
            var hasher = new PasswordHasher<User>();
            foreach (User user in users)
            {
                user.PasswordHash = hasher.HashPassword(user, "12h444hHndndHJ");
            }

            return users;
        }
    }
}
