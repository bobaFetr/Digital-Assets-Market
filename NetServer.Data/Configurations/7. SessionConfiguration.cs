using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class SessionConfiguration
    {
        public void Configure(EntityTypeBuilder<SessionTable> builder)
        {
            builder.HasKey(s => s.SessionId);

            builder.HasData(SessionTableSeeding.GenerateSessions());

            //builder.HasOne(s => s.User)
            //       .WithMany(u => u.Sessions)
            //       .HasForeignKey(s => s.UserId);
        }
    }
}
