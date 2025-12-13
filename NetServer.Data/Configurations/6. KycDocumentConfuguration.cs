using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class KycDocumentConfuguration
    {
        public void Configure(EntityTypeBuilder<KycDocument> builder)
        {
            
           builder.HasKey(k => k.DocId);

            builder.HasData(KycDocumentSeeding.GenerateKycDocuments());

            //builder.HasOne(k => k.User)
            //       .WithMany(u => u.KycDocuments)
            //       .HasForeignKey(k => k.UserId);
        }
    }
}
