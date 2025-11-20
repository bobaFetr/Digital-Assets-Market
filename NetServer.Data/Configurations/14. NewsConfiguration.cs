using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public  class NewsConfiguration
    {
        public void Configure(EntityTypeBuilder<NewsTable> builder)
        {
            builder.HasData(NewsSeeding.GenerateNews());

            builder.HasKey(n => n.NewsId);

            // Readers relationship (many-to-many style, but simplified here)
            builder.HasMany(n => n.Readers)
                   .WithMany(); // If you want a join table, configure separately

            // Example: CategoryId is just a scalar, no navigation defined
            builder.Property(n => n.CategoryId).IsRequired();
        }
    }
}
