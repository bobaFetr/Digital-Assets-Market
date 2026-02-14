using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/audit-logs")]
[Authorize]
public class AuditLogsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public AuditLogsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] Guid? userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.AuditLogs.AsNoTracking();

        if (IsAdmin())
        {
            if (userId.HasValue)
            {
                query = query.Where(l => l.UserId == userId.Value);
            }
        }
        else
        {
            query = query.Where(l => l.UserId == currentUserId);
        }

        var logs = await query.Select(l => ToDto(l)).ToListAsync();
        return Ok(logs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetLog(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var log = await _db.AuditLogs.AsNoTracking().FirstOrDefaultAsync(l => l.LogId == id);
        if (log == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && log.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(log));
    }

    [HttpPost]
    public async Task<IActionResult> CreateLog([FromBody] CreateAuditLogRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var targetUserId = request.UserId ?? currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId)
        {
            return Forbid();
        }

        var log = new AuditLog
        {
            LogId = Guid.NewGuid(),
            UserId = targetUserId,
            Action = request.Action,
            Details = request.Details,
            Timestamp = request.Timestamp ?? DateTime.UtcNow
        };

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLog), new { id = log.LogId }, ToDto(log));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateLog(Guid id, [FromBody] UpdateAuditLogRequest request)
    {
        var log = await _db.AuditLogs.FirstOrDefaultAsync(l => l.LogId == id);
        if (log == null)
        {
            return NotFound();
        }

        if (request.Action != null)
        {
            log.Action = request.Action;
        }

        if (request.Details != null)
        {
            log.Details = request.Details;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(log));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteLog(Guid id)
    {
        var log = await _db.AuditLogs.FirstOrDefaultAsync(l => l.LogId == id);
        if (log == null)
        {
            return NotFound();
        }

        _db.AuditLogs.Remove(log);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static AuditLogDto ToDto(AuditLog log)
    {
        return new AuditLogDto
        {
            LogId = log.LogId,
            UserId = log.UserId,
            Action = log.Action,
            Details = log.Details,
            Timestamp = log.Timestamp
        };
    }
}
