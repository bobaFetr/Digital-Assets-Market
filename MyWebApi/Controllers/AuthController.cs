using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using NetServer.Data; // Added Namespace
using NetServer.Data.Models; // Added Namespace
using System.ComponentModel.DataAnnotations;
using MyWebApi.Services;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailSender _emailSender;
    private readonly WalletProvisioningService _walletProvisioning;

    public AuthController(AppDbContext db, IConfiguration config, IEmailSender emailSender, WalletProvisioningService walletProvisioning)
    {
        _db = db;
        _config = config;
        _emailSender = emailSender;
        _walletProvisioning = walletProvisioning;
    }

    // REGISTER
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (_db.Users.Any(u => u.Email == request.Email))
        {
             return BadRequest("User already exists.");
        }

        if (string.IsNullOrWhiteSpace(request.UserName))
            return BadRequest("UserName is required.");

        var user = new User
        {
            UserName = request.UserName.Trim(),
            Email = request.Email.Trim(),
            Password = request.Password,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role
        };

        user.Role = string.IsNullOrWhiteSpace(user.Role) ? "User" : user.Role;
        user.CreatedAt = user.CreatedAt == default ? DateTime.UtcNow : user.CreatedAt;
        user.Status = user.Status == default ? NetServer.Data.Models.User.StatusBit.Active : user.Status;
        user.IsBanned = false;

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _db.Users.Add(user);
        _walletProvisioning.EnsureDefaultWalletsForUser(user.Id);
        _db.SaveChanges();
        return Ok("User registered successfully");
    }

    [HttpPost("register-admin")]
    public IActionResult RegisterAdmin(User user)
    {
         if (_db.Users.Any(u => u.Email == user.Email))
        {
             return BadRequest("User already exists.");
        }

        if (string.IsNullOrWhiteSpace(user.UserName))
            return BadRequest("UserName is required.");

        user.Role = "Admin";
        user.CreatedAt = user.CreatedAt == default ? DateTime.UtcNow : user.CreatedAt;
        user.Status = user.Status == default ? NetServer.Data.Models.User.StatusBit.Active : user.Status;
        user.IsBanned = false;

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _db.Users.Add(user);
        _walletProvisioning.EnsureDefaultWalletsForUser(user.Id);
        _db.SaveChanges();
        return Ok("Admin registered");
    }

    // LOGIN (returns JWT)
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var existing = _db.Users
            .FirstOrDefault(u => u.Email == request.Email);

        if (existing == null || !BCrypt.Net.BCrypt.Verify(request.Password, existing.Password))
            return Unauthorized("Invalid credentials");

        if (existing.IsBanned)
            return StatusCode(403, "User is banned");

        _walletProvisioning.EnsureDefaultWalletsForUser(existing.Id);
        _db.SaveChanges();

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, existing.Id.ToString()),
            new Claim(ClaimTypes.Email, existing.Email),
            new Claim(ClaimTypes.Role, existing.Role)
        };

        var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token)
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("wallets/backfill")]
    public IActionResult BackfillMissingWallets()
    {
        var usersCount = _db.Users.Count();
        var createdCount = _walletProvisioning.EnsureDefaultWalletsForAllUsers();

        _db.SaveChanges();
        return Ok(new
        {
            usersProcessed = usersCount,
            walletsCreated = createdCount,
            currenciesPerUser = WalletProvisioningService.DefaultWalletCurrencies.Length
        });
    }



    // PROFILE (JWT protected)
    [Authorize]
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = _db.Users.Find(userId);
        if (user == null || user.IsBanned)
            return StatusCode(403, "User is banned");


        return Ok(new
        {
            user.Email,
            user.Role
        });
    }


    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        return Ok(_db.Users.Select(u => new {
            u.Id,
            u.Email,
            u.Role,
            u.IsBanned
        }));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users/banned")]
    public IActionResult GetBannedUsers()
    {
        return Ok(_db.Users
            .Where(u => u.IsBanned)
            .Select(u => new { u.Id, u.Email }));
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users/active")]
    public IActionResult GetActiveUsers()
    {
        return Ok(_db.Users
            .Where(u => !u.IsBanned)
            .Select(u => new { u.Id, u.Email }));
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("users/{id}/ban")]
    public IActionResult BanUser(Guid id)
    {
        var user = _db.Users.Find(id);
        if (user == null) return NotFound();

        user.IsBanned = true;
        _db.SaveChanges();
        return Ok("User banned");
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users/ban-by-email")]
    public IActionResult BanUserByEmail([FromBody] BanRequest request)
    {
        var user = _db.Users.FirstOrDefault(u => u.Email == request.Email);
        if (user == null) return NotFound();

        user.IsBanned = true;
        _db.SaveChanges();
        return Ok("User banned");
    }

    // LOGOUT (client-side only for JWT)
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok();
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = _db.Users.FirstOrDefault(u => u.Email.ToLower() == normalizedEmail);

        if (user != null)
        {
            var resetToken = CreatePasswordResetToken(user);
            var frontendBaseUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var resetUrl = $"{frontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(resetToken)}";

            var subject = "Reset your password";
            var body = $"Use this link to reset your password: {resetUrl}";
            try
            {
                await _emailSender.SendAsync(user.Email, subject, body);
            }
            catch
            {
                return StatusCode(503, "Email service is unavailable. Please try again later.");
            }
        }

        return Ok("If an account with that email exists, a reset link has been sent.");
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("Token and new password are required.");
        }

        var principal = ValidatePasswordResetToken(request.Token);
        if (principal == null)
        {
            return BadRequest("Invalid or expired reset token.");
        }

        var email = principal.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest("Invalid token payload.");
        }

        var user = _db.Users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
        if (user == null)
        {
            return BadRequest("User not found.");
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _db.SaveChanges();

        return Ok("Password has been reset successfully.");
    }

    private string CreatePasswordResetToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("purpose", "password_reset")
        };

        var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing.");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private ClaimsPrincipal? ValidatePasswordResetToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is missing."))),
                ClockSkew = TimeSpan.FromMinutes(1)
            }, out _);

            var purpose = principal.FindFirstValue("purpose");
            if (!string.Equals(purpose, "password_reset", StringComparison.Ordinal))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

}

public class BanRequest
{
    public string Email { get; set; } = "";
}

public class RegisterRequest
{
    [Required]
    public string UserName { get; set; } = "";

    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";

    public string? Role { get; set; }
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";
}

public class ResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = "";

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = "";
}
