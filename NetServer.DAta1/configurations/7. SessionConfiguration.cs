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
    public class SessionConfiguration : IEntityTypeConfiguration<SessionTable>
    {
        public void Configure(EntityTypeBuilder<SessionTable> builder)
        {
            builder.HasKey(s => s.SessionId);
            builder.HasData(Session1Seeding.GenerateSessions());
        }
    }
}