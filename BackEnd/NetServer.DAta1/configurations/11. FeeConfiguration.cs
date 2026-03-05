using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;
using System;

namespace NetServer.Data.Configurations
{
    public class FeeConfiguration : IEntityTypeConfiguration<FeeTable>
    {
        public void Configure(EntityTypeBuilder<FeeTable> builder)
        {
            builder.HasKey(x => x.FeeTableId);
            builder.HasData(FeeSeeding.GenerateFees());
        }
    }
}