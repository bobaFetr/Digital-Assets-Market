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
    public class KycDocumentConfiguration : IEntityTypeConfiguration<KycDocument>
    {
        public void Configure(EntityTypeBuilder<KycDocument> builder)
        {
            builder.HasKey(k => k.DocId);
            builder.HasData(KycDocumentSeeding.GenerateKycDocuments());
        }
    }
}