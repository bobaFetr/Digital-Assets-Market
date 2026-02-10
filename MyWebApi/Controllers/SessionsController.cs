using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/sessions")]
[Authorize]
public class SessionsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public SessionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions([FromQuery] Guid? userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.Sessions.AsNoTracking();

        if (IsAdmin())
        {
            if (userId.HasValue)
            {
                query = query.Where(s => s.UserId == userId.Value);
            }
        }
        else
        {
            query = query.Where(s => s.UserId == currentUserId);
        }

        var sessions = await query.Select(s => ToDto(s)).ToListAsync();
        return Ok(sessions);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var session = await _db.Sessions.AsNoTracking().FirstOrDefaultAsync(s => s.SessionId == id);
        if (session == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && session.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(session));
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateSessionRequest request)
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

        var session = new SessionTable
        {
            SessionId = Guid.NewGuid(),
            UserId = targetUserId,
            Token = request.Token,
            IpAddress = request.IpAddress,
            DeviceInfo = request.DeviceInfo,
            CreatedAt = request.CreatedAt ?? DateTime.UtcNow,
            ExpiresAt = request.ExpiresAt ?? DateTime.UtcNow.AddHours(12)
        };

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSession), new { id = session.SessionId }, ToDto(session));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateSession(Guid id, [FromBody] UpdateSessionRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var session = await _db.Sessions.FirstOrDefaultAsync(s => s.SessionId == id);
        if (session == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && session.UserId != currentUserId)
        {
            return Forbid();
        }

        if (request.IpAddress != null)
        {
            session.IpAddress = request.IpAddress;
        }

        if (request.DeviceInfo != null)
        {
            session.DeviceInfo = request.DeviceInfo;
        }

        if (request.ExpiresAt.HasValue)
        {
            session.ExpiresAt = request.ExpiresAt.Value;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(session));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSession(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var session = await _db.Sessions.FirstOrDefaultAsync(s => s.SessionId == id);
        if (session == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && session.UserId != currentUserId)
        {
            return Forbid();
        }

        _db.Sessions.Remove(session);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static SessionDto ToDto(SessionTable session)
    {
        return new SessionDto
        {
            SessionId = session.SessionId,
            UserId = session.UserId,
            IpAddress = session.IpAddress,
            DeviceInfo = session.DeviceInfo,
            CreatedAt = session.CreatedAt,
            ExpiresAt = session.ExpiresAt
        };
    }
}
