using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding;

namespace NetServer.Data.Configurations
{
    public class FeeConfiguration
    {
        public void Configure(EntityTypeBuilder<Fee> builder)
        {
            //GenerateFees
            builder.HasData(FeeSeeding.GenerateFees());
        }
    }
}
