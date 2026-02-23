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

    [HttpGet("me/export")]
    public async Task<IActionResult> ExportMyAccountInfo()
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

        var wallets = await _db.Wallets
            .AsNoTracking()
            .Where(w => w.UserId == userId)
            .Select(w => new
            {
                w.WalletID,
                w.Currency,
                w.Balance,
                Address = w.Addres,
                w.Status,
                w.CreatedAt
            })
            .ToListAsync();

        var orders = await _db.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId)
            .Select(o => new
            {
                o.OrderId,
                o.TypeOfOrder,
                o.Symbol,
                o.Price,
                o.Amount,
                o.OrderStatus,
                o.CreatedAt
            })
            .ToListAsync();

        var transactions = await _db.Transactions
            .AsNoTracking()
            .Where(t => t.UserID == userId)
            .Select(t => new
            {
                TransactionId = t.TransactionID,
                t.TypeOfTransaction,
                t.Currency,
                t.Amount,
                t.Status,
                t.BlockchainTransactionHash,
                t.TimeStamp
            })
            .ToListAsync();

        var sessions = await _db.Sessions
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => new
            {
                s.SessionId,
                s.IpAddress,
                s.DeviceInfo,
                s.CreatedAt,
                s.ExpiresAt
            })
            .ToListAsync();

        var kycDocuments = await _db.KycDocuments
            .AsNoTracking()
            .Where(k => k.UserId == userId)
            .Select(k => new
            {
                k.DocId,
                k.Type,
                k.FilePath,
                k.DocumentNumber,
                k.FullName,
                k.DateOfBirth,
                k.CountryOfResidence,
                k.ExpiryDate,
                k.Status,
                k.UploadedAt
            })
            .ToListAsync();

        var faqs = await _db.FAQs
            .AsNoTracking()
            .Where(f => f.AuthorId == userId || f.RepliedByUserId == userId)
            .Select(f => new
            {
                f.FaqId,
                f.Question,
                f.QuestionImageUrl,
                f.Answer,
                f.AuthorId,
                f.RepliedByUserId,
                f.CreatedAt,
                f.UpdatedAt
            })
            .ToListAsync();

        var payload = new
        {
            exportedAtUtc = DateTime.UtcNow,
            profile = new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.Role,
                user.ProfilePictureUrl,
                user.CreatedAt,
                user.Status,
                user.IsBanned
            },
            wallets,
            orders,
            transactions,
            sessions,
            kycDocuments,
            faqs
        };

        return Ok(payload);
    }

    [HttpPut("me/profile-picture")]
    public async Task<IActionResult> UpdateMyProfilePicture([FromBody] UpdateProfilePictureRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (request == null || string.IsNullOrWhiteSpace(request.ProfilePictureUrl))
        {
            return BadRequest("ProfilePictureUrl is required.");
        }

        var profilePictureUrl = request.ProfilePictureUrl.Trim();
        var isDataImage = profilePictureUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase);

        if (isDataImage)
        {
            if (!profilePictureUrl.Contains(";base64,", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("ProfilePictureUrl data:image value must be base64-encoded.");
            }
        }
        else
        {
            if (!Uri.TryCreate(profilePictureUrl, UriKind.Absolute, out var parsedUri)
                || (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps))
            {
                return BadRequest("ProfilePictureUrl must be an absolute http/https URL or a data:image base64 value.");
            }
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound();
        }

        user.ProfilePictureUrl = profilePictureUrl;
        await _db.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    [HttpPut("me/username")]
    public async Task<IActionResult> UpdateMyUserName([FromBody] UpdateUserNameRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (request == null || string.IsNullOrWhiteSpace(request.UserName))
        {
            return BadRequest("UserName is required.");
        }

        var normalizedUserName = request.UserName.Trim();
        if (normalizedUserName.Length < 3)
        {
            return BadRequest("UserName must be at least 3 characters.");
        }

        var normalizedUserNameLower = normalizedUserName.ToLowerInvariant();
        var isTakenByAnotherUser = await _db.Users
            .AnyAsync(u => u.Id != userId && u.UserName.ToLower() == normalizedUserNameLower);

        if (isTakenByAnotherUser)
        {
            return BadRequest("Username already exists.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return NotFound();
        }

        user.UserName = normalizedUserName;
        await _db.SaveChangesAsync();

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

        var users = await query.ToListAsync();
        var userIds = users.Select(u => u.Id).ToList();

        var sessions = await _db.Sessions
            .AsNoTracking()
            .Where(s => userIds.Contains(s.UserId))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var latestSessionByUser = sessions
            .GroupBy(s => s.UserId)
            .ToDictionary(group => group.Key, group => group.First());

        var result = users.Select(u =>
        {
            latestSessionByUser.TryGetValue(u.Id, out var latestSession);
            return ToDto(u, latestSession);
        }).ToList();

        return Ok(result);
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

        var latestSession = await _db.Sessions
            .AsNoTracking()
            .Where(s => s.UserId == id)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();

        return Ok(ToDto(user, latestSession));
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

    private static UserDto ToDto(User user, SessionTable? latestSession = null)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            ProfilePictureUrl = user.ProfilePictureUrl ?? "/OIP.webp",
            LastDeviceInfo = latestSession?.DeviceInfo,
            LastIpAddress = latestSession?.IpAddress,
            LastSeenAt = latestSession?.CreatedAt,
            CreatedAt = user.CreatedAt,
            Status = user.Status,
            IsBanned = user.IsBanned
        };
    }
}

public class UpdateProfilePictureRequest
{
    public string ProfilePictureUrl { get; set; } = string.Empty;
}

public class UpdateUserNameRequest
{
    public string UserName { get; set; } = string.Empty;
}

public class UserBanRequest
{
    public Guid? Id { get; set; }
    public string? Email { get; set; }
}
