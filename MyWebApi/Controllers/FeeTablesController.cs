using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/fee-tables")]
[Authorize]
public class FeeTablesController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public FeeTablesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetFeeTables([FromQuery] string? symbol)
    {
        var query = _db.FeeTables.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(symbol))
        {
            query = query.Where(f => f.Symbol == symbol);
        }

        var fees = await query.Select(f => ToDto(f)).ToListAsync();
        return Ok(fees);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetFeeTable(Guid id)
    {
        var fee = await _db.FeeTables.AsNoTracking().FirstOrDefaultAsync(f => f.FeeTableId == id);
        if (fee == null)
        {
            return NotFound();
        }

        return Ok(ToDto(fee));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateFeeTable([FromBody] CreateFeeTableRequest request)
    {
        var fee = new FeeTable
        {
            FeeTableId = Guid.NewGuid(),
            Symbol = request.Symbol,
            FeeType = request.FeeType,
            FeeAmount = request.FeeAmount,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.FeeTables.Add(fee);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFeeTable), new { id = fee.FeeTableId }, ToDto(fee));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateFeeTable(Guid id, [FromBody] UpdateFeeTableRequest request)
    {
        var fee = await _db.FeeTables.FirstOrDefaultAsync(f => f.FeeTableId == id);
        if (fee == null)
        {
            return NotFound();
        }

        if (request.Symbol != null)
        {
            fee.Symbol = request.Symbol;
        }

        if (request.FeeType != null)
        {
            fee.FeeType = request.FeeType;
        }

        if (request.FeeAmount.HasValue)
        {
            fee.FeeAmount = request.FeeAmount.Value;
        }

        fee.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(ToDto(fee));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFeeTable(Guid id)
    {
        var fee = await _db.FeeTables.FirstOrDefaultAsync(f => f.FeeTableId == id);
        if (fee == null)
        {
            return NotFound();
        }

        _db.FeeTables.Remove(fee);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static FeeTableDto ToDto(FeeTable fee)
    {
        return new FeeTableDto
        {
            FeeTableId = fee.FeeTableId,
            Symbol = fee.Symbol,
            FeeType = fee.FeeType,
            FeeAmount = fee.FeeAmount,
            CreatedAt = fee.CreatedAt,
            UpdatedAt = fee.UpdatedAt
        };
    }
}
