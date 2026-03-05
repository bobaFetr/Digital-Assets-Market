using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;
namespace NetServer.Data.Configurations
{
    public class NewsConfiguration : IEntityTypeConfiguration<NewsTable>
    {
        public void Configure(EntityTypeBuilder<NewsTable> builder)
        {
            builder.HasKey(x => x.NewsId);
            builder.HasData(NewsSeeding.GenerateNews());
        }
    }
}