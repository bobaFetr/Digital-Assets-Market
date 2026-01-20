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
            //builder.HasData(UserSeeding);


            //builder.HasMany(u => u.Wallets)
            //  .WithOne(w => w.User)
            //  .HasForeignKey(w => w.UserId)
            //  .OnDelete(DeleteBehavior.Cascade);


            //}
        }//move the cotent in the
    }
}
//using NetServer.Data.Models;
//using NetServer.Data.Seeding;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata.Builders;

//namespace FitnessTracker.Data.Configurations
//{
//    public class EquipmentConfiguration : IEntityTypeConfiguration<User>
//    {
//        public void Configure(EntityTypeBuilder<User> builder)
//        {
//            builder.HasKey(e => e.Id);
//            //
//            //geneerate users
//            builder.HasData(UserSeeding);
//        }
//    }
//}