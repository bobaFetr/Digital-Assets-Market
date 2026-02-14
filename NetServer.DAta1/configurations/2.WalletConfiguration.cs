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
    public class WalletConfiguration : IEntityTypeConfiguration<WalletTable>
    {
        public void Configure(EntityTypeBuilder<WalletTable> builder)
        {
            builder.HasKey(w => w.WalletID);
            builder.HasData(WalletSeeding.GenerateWallets());
        }
    }
}