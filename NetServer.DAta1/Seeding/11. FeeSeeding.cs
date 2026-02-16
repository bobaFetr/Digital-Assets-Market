using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
using System.Collections.Generic;
using System;

namespace NetServer.Data.Seeding
{
	public static class FeeSeeding
	{
		public static IEnumerable<FeeTable> GenerateFees()
		{
			var fees = new HashSet<FeeTable>();
			fees.Add(new FeeTable
			{
				FeeTableId = DataSeedingConstants.FeeConstants.Fee1Id,
				Symbol = DataSeedingConstants.FeeConstants.Symbol1,
				FeeType = "Maker",
				FeeAmount = DataSeedingConstants.FeeConstants.MakerFee1,
				CreatedAt = DataSeedingConstants.FeeConstants.UpdatedAt1,
				UpdatedAt = DataSeedingConstants.FeeConstants.UpdatedAt1
			});
			return fees;
		}
	}
}
