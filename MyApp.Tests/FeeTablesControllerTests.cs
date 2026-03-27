using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class FeeTablesControllerTests
{
    [Test]
    public async Task GetFeeTables_FiltersBySymbol_WhenProvided()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        db.FeeTables.AddRange(
            new FeeTable
            {
                FeeTableId = Guid.NewGuid(),
                Symbol = "BTCUSD",
                FeeType = "Maker",
                FeeAmount = 0.1m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new FeeTable
            {
                FeeTableId = Guid.NewGuid(),
                Symbol = "ETHUSD",
                FeeType = "Taker",
                FeeAmount = 0.2m,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new FeeTablesController(db);

        var result = await controller.GetFeeTables("BTCUSD");

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var fees = ok!.Value as IEnumerable<FeeTableDto>;
        Assert.That(fees, Is.Not.Null);
        Assert.That(fees!.Count(), Is.EqualTo(1));
        Assert.That(fees.Single().Symbol, Is.EqualTo("BTCUSD"));
    }

    [Test]
    public async Task UpdateFeeTable_UpdatesFieldsAndRefreshesUpdatedAt()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var originalUpdatedAt = DateTime.UtcNow.AddHours(-1);
        var fee = new FeeTable
        {
            FeeTableId = Guid.NewGuid(),
            Symbol = "BTCUSD",
            FeeType = "Maker",
            FeeAmount = 0.1m,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = originalUpdatedAt
        };
        db.FeeTables.Add(fee);
        await db.SaveChangesAsync();

        var controller = new FeeTablesController(db);

        var result = await controller.UpdateFeeTable(fee.FeeTableId, new UpdateFeeTableRequest
        {
            Symbol = "ETHUSD",
            FeeType = "Taker",
            FeeAmount = 0.25m
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(fee.Symbol, Is.EqualTo("ETHUSD"));
        Assert.That(fee.FeeType, Is.EqualTo("Taker"));
        Assert.That(fee.FeeAmount, Is.EqualTo(0.25m));
        Assert.That(fee.UpdatedAt, Is.GreaterThan(originalUpdatedAt));
    }
}
