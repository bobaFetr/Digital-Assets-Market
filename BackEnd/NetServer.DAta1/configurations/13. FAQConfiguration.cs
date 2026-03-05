using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;

namespace NetServer.Data.Configurations
{
    public class FAQConfiguration : IEntityTypeConfiguration<FAQ>
    {
        public void Configure(EntityTypeBuilder<FAQ> builder)
        {
            builder.HasKey(x => x.FaqId);
            builder.HasData(FAQSeeding.GenerateFAQs());
        }
    }
}