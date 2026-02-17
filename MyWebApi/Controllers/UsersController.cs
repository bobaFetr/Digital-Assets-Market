using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(ToDto(user));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        IQueryable<User> query = _db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = status.Trim().ToLowerInvariant();
            if (normalizedStatus == "active")
            {
                query = query.Where(u => !u.IsBanned);
            }
            else if (normalizedStatus == "banned")
            {
                query = query.Where(u => u.IsBanned);
            }
            else
            {
                return BadRequest("Invalid status filter. Use 'active' or 'banned'.");
            }
        }

        var users = await query.Select(u => ToDto(u)).ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(ToDto(user));
    }

    [HttpPost("ban")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BanUser([FromBody] UserBanRequest request)
    {
        if (!HasIdentifier(request))
        {
            return BadRequest("Provide a user id or email.");
        }

        var user = await FindUserAsync(request);
        if (user == null)
        {
            return NotFound();
        }

        if (!user.IsBanned)
        {
            user.IsBanned = true;
            await _db.SaveChangesAsync();
        }

        return Ok(ToDto(user));
    }

    [HttpPost("unban")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UnbanUser([FromBody] UserBanRequest request)
    {
        if (!HasIdentifier(request))
        {
            return BadRequest("Provide a user id or email.");
        }

        var user = await FindUserAsync(request);
        if (user == null)
        {
            return NotFound();
        }

        if (user.IsBanned)
        {
            user.IsBanned = false;
            await _db.SaveChangesAsync();
        }

        return Ok(ToDto(user));
    }

    private static bool HasIdentifier(UserBanRequest request)
    {
        return request != null
            && (request.Id.HasValue || !string.IsNullOrWhiteSpace(request.Email));
    }

    private async Task<User?> FindUserAsync(UserBanRequest request)
    {
        if (request == null)
        {
            return null;
        }

        if (request.Id.HasValue)
        {
            return await _db.Users.FirstOrDefaultAsync(u => u.Id == request.Id.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            return await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }

        return null;
    }

    private static UserDto ToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            Status = user.Status,
            IsBanned = user.IsBanned
        };
    }
}

public class UserBanRequest
{
    public Guid? Id { get; set; }
    public string? Email { get; set; }
}
