using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class AuditLogConfiguration
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            //builder.(KycDocumentSeeding.GenerateTrades());
            builder.HasData(AuditLogSeeding.GenerateAuditLogs());

            builder.HasKey(a => a.LogId);

            builder.HasOne(a => a.User)
                   .WithMany(u => u.AuditLogs)
                   .HasForeignKey(a => a.UserId);

           
        }
    }
}
