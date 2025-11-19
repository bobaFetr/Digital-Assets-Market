using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static  class FeeSeeding
    {
        public static ICollection<Fee> GenerateTrades()
        {
            var fees = new HashSet<Fee>();
            fees.Add(new Fee
            {
                FeeId = Guid.NewGuid(),
                Symbol = "BTCUSD",
                MakerFee = 0.0002m,
                TakerFee = 0.0005m,
                UpdatedAt = DateTime.UtcNow
            });
            return fees;
        }
    }
}
