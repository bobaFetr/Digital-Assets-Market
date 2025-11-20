using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class FAQConfiguration
    {
        public void Configure(EntityTypeBuilder<FAQTable> builder)
        {
            builder.HasData(FAQSeeding.GenerateFAQ());

             // Author relationship
            builder.HasOne(f => f.Author)
                   .WithMany()
                   .HasForeignKey(f => f.CategoryId) // adjust if you want a proper FK
                   .OnDelete(DeleteBehavior.Cascade);

            // Readers relationship
            builder.HasMany(f => f.Readers)
                   .WithMany();
        }
    }
}
