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

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
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

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, existing.Id.ToString()),
            new Claim(ClaimTypes.Email, existing.Email),
            new Claim(ClaimTypes.Role, existing.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]));

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



    // PROFILE (JWT protected)
    [Authorize]
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

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
