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
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

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
    [EnableRateLimiting("AuthSensitive")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .Distinct()
                .ToList();

            return BadRequest(new { errors });
        }
        if (_db.Users.Any(u => u.Email == request.Email))
        {
             return BadRequest("User already exists.");
        }

        if (string.IsNullOrWhiteSpace(request.UserName))
            return BadRequest("UserName is required.");

        if (!RequestSecurity.TryValidatePlainText(request.UserName, "UserName", out var normalizedUserName, out var userNameError, 100))
        {
            return BadRequest(userNameError);
        }

        var normalizedUserNameLower = normalizedUserName.ToLowerInvariant();
        if (_db.Users.Any(u => u.UserName.ToLower() == normalizedUserNameLower))
        {
            return BadRequest("Username already exists.");
        }

        // KYC is optional. If any KYC field is supplied require the full set and validate.
        var hasKycProvided = !string.IsNullOrWhiteSpace(request.FullName)
                     || !string.IsNullOrWhiteSpace(request.IdNumber)
                     || !string.IsNullOrWhiteSpace(request.Country)
                     || request.DateOfBirth.HasValue
                     || request.ExpiryDate.HasValue;

        DateTime? dobUtc = null;
        DateTime? expiryUtc = null;

        if (hasKycProvided)
        {
            if (string.IsNullOrWhiteSpace(request.FullName)
                || string.IsNullOrWhiteSpace(request.IdNumber)
                || string.IsNullOrWhiteSpace(request.Country)
                || !request.DateOfBirth.HasValue
                || !request.ExpiryDate.HasValue)
            {
                return BadRequest("When providing identity verification, all ID fields are required: FullName, IdNumber, Country, DateOfBirth, ExpiryDate.");
            }

            // Normalize incoming dates to UTC to satisfy PostgreSQL timestamptz requirements
            dobUtc = DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc);
            expiryUtc = DateTime.SpecifyKind(request.ExpiryDate.Value, DateTimeKind.Utc);

            if (!IsAtLeast18(dobUtc.Value))
            {
                return BadRequest("User must be at least 18 years old.");
            }

            if (expiryUtc.Value <= DateTime.UtcNow.Date)
            {
                return BadRequest("ID document is expired.");
            }

            if (!RequestSecurity.TryValidatePlainText(request.FullName, "FullName", out var sanitizedFullName, out var fullNameError, 200))
            {
                return BadRequest(fullNameError);
            }

            if (!RequestSecurity.TryValidatePlainText(request.IdNumber, "IdNumber", out var sanitizedIdNumber, out var idNumberError, 100))
            {
                return BadRequest(idNumberError);
            }

            if (!RequestSecurity.TryValidatePlainText(request.Country, "Country", out var sanitizedCountry, out var countryError, 100))
            {
                return BadRequest(countryError);
            }

            request.FullName = sanitizedFullName;
            request.IdNumber = sanitizedIdNumber;
            request.Country = sanitizedCountry;

            if (!string.IsNullOrWhiteSpace(request.DocumentType))
            {
                if (!RequestSecurity.TryValidatePlainText(request.DocumentType, "DocumentType", out var sanitizedDocumentType, out var documentTypeError, 100))
                {
                    return BadRequest(documentTypeError);
                }

                request.DocumentType = sanitizedDocumentType;
            }
        }

        var user = new User
        {
            UserName = normalizedUserName,
            Email = request.Email.Trim(),
            Password = request.Password,
            Role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role
        };

        user.Role = string.IsNullOrWhiteSpace(user.Role) ? "User" : user.Role;//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        user.CreatedAt = user.CreatedAt == default ? DateTime.UtcNow : user.CreatedAt;
        user.Status = user.Status == default ? NetServer.Data.Models.User.StatusBit.Active : user.Status;
        user.IsBanned = false;///////////////////////////////////////////////////////////////////////////////////////////////////////////////

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _db.Users.Add(user);

        if (hasKycProvided)
        {
            _db.KycDocuments.Add(new KycDocument
            {
                DocId = Guid.NewGuid(),
                UserId = user.Id,
                Type = string.IsNullOrWhiteSpace(request.DocumentType) ? "Passport" : request.DocumentType.Trim(),
                FilePath = request.IdFilePath?.Trim() ?? string.Empty,
                DocumentNumber = request.IdNumber.Trim(),
                FullName = request.FullName.Trim(),
                DateOfBirth = dobUtc.Value,
                CountryOfResidence = request.Country.Trim(),
                ExpiryDate = expiryUtc.Value,
                Status = "Verified",
                UploadedAt = DateTime.UtcNow
            });
        }

        // Create wallets according to user choices provided at registration (bank and initial crypto)
        _walletProvisioning.EnsureDefaultWalletsForUser(user.Id, request.BankAccountCurrencies, request.InitialCryptoCurrencies);
        _db.SaveChanges();
        return Ok("User registered successfully");
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("register-admin")]
    public IActionResult RegisterAdmin([FromBody] RegisterAdminRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .Distinct()
                .ToList();

            return BadRequest(new { errors });
        }

         if (_db.Users.Any(u => u.Email == request.Email))
        {
             return BadRequest("User already exists.");
        }

        if (string.IsNullOrWhiteSpace(request.UserName))
            return BadRequest("UserName is required.");

        if (!RequestSecurity.TryValidatePlainText(request.UserName, "UserName", out var normalizedUserName, out var userNameError, 100))
        {
            return BadRequest(userNameError);
        }

        var normalizedUserNameLower = normalizedUserName.ToLowerInvariant();
        if (_db.Users.Any(u => u.UserName.ToLower() == normalizedUserNameLower))
        {
            return BadRequest("Username already exists.");
        }

        var user = new User
        {
            UserName = normalizedUserName,
            Email = request.Email.Trim(),
            Password = request.Password,
            Role = "Admin"
        };

        user.CreatedAt = user.CreatedAt == default ? DateTime.UtcNow : user.CreatedAt;
        user.Status = user.Status == default ? NetServer.Data.Models.User.StatusBit.Active : user.Status;
        user.IsBanned = false;

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        _db.Users.Add(user);
        _walletProvisioning.EnsureDefaultWalletsForUser(user.Id);
        _db.SaveChanges();
        return Ok("Admin registered");
    }

    // LOGIN (creates an HttpOnly authentication cookie)
    [HttpPost("login")]
    [EnableRateLimiting("AuthSensitive")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errs = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .Distinct()
                .ToList();
            return BadRequest(new { errors = errs });
        }

        var existing = _db.Users
            .FirstOrDefault(u => u.Email == request.Email);

        if (existing == null)
            return Unauthorized("Invalid credentials");

        var isValidPassword = VerifyPassword(request.Password, existing.Password, out var shouldUpgradePasswordHash);
        if (!isValidPassword)
            return Unauthorized("Invalid credentials");

        if (existing.IsBanned)
            return StatusCode(403, "Your account  is banned");

        if (shouldUpgradePasswordHash)
        {
            existing.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        _walletProvisioning.EnsureDefaultWalletsForUser(existing.Id);
        _db.SaveChanges();

        var sessionId = Guid.NewGuid();
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, existing.Id.ToString()),
            new Claim(ClaimTypes.Email, existing.Email),
            new Claim(ClaimTypes.Role, existing.Role),
            new Claim("sid", sessionId.ToString())
        };
        var userAgent = Request.Headers.UserAgent.ToString();
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        _db.Sessions.Add(new SessionTable
        {
            SessionId = sessionId,
            UserId = existing.Id,
            Token = Convert.ToHexString(SHA256.HashData(sessionId.ToByteArray())),
            IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? "Unknown IP" : ipAddress,
            DeviceInfo = string.IsNullOrWhiteSpace(userAgent) ? "Unknown device" : userAgent,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        });
        _db.SaveChanges();

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)),
            new AuthenticationProperties
        {
            IsPersistent = request.RememberMe,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1),
            AllowRefresh = false
        });

        // Non-sensitive UI hint only. Authorization always relies on the protected HttpOnly cookie.
        Response.Cookies.Append("dam_auth", "1", new CookieOptions
        {
            HttpOnly = false,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            MaxAge = request.RememberMe ? TimeSpan.FromHours(1) : null,
            IsEssential = true
        });
        Response.Cookies.Append("dam_role", Uri.EscapeDataString(existing.Role), new CookieOptions
        {
            HttpOnly = false,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            MaxAge = request.RememberMe ? TimeSpan.FromHours(1) : null,
            IsEssential = true
        });

        return Ok(new { authenticated = true });
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
            user.UserName,
            user.Email,
            user.Role,
            ProfilePictureUrl = user.ProfilePictureUrl ?? "/OIP.webp"
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

    // LOGOUT (revokes the server-side session backing the JWT)
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var sessionIdValue = User.FindFirstValue("sid");
        if (Guid.TryParse(sessionIdValue, out var sessionId))
        {
            var session = _db.Sessions.FirstOrDefault(s => s.SessionId == sessionId);
            if (session != null)
            {
                _db.Sessions.Remove(session);
                _db.SaveChanges();
            }
        }
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        Response.Cookies.Delete("dam_auth", new CookieOptions { Path = "/" });
        Response.Cookies.Delete("dam_role", new CookieOptions { Path = "/" });
        return Ok();
    }

    [Authorize]
    [HttpPost("change-password")]
    public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errs = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .Distinct()
                .ToList();
            return BadRequest(new { errors = errs });
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest("Current and new password are required.");
        }

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = _db.Users.Find(userId);
        if (user == null)
        {
            return NotFound();
        }

        if (user.IsBanned)
        {
            return StatusCode(403, "User is banned");
        }

        if (!VerifyPassword(request.CurrentPassword, user.Password, out _))
        {
            return BadRequest("Current password is incorrect.");
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            return BadRequest("New password must be different from current password.");
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        _db.Sessions.RemoveRange(_db.Sessions.Where(s => s.UserId == userId));
        _db.SaveChanges();

        return Ok("Password changed successfully.");
    }

    [Authorize]
    [HttpPost("delete-account")]
    public IActionResult DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            return BadRequest("Current password is required.");
        }

        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var user = _db.Users.Find(userId);
        if (user == null)
        {
            return NotFound();
        }

        if (!VerifyPassword(request.CurrentPassword, user.Password, out _))
        {
            return BadRequest("Current password is incorrect.");
        }

        var walletsWithBalance = _db.Wallets.Where(w => w.UserId == userId && w.Balance > 0).ToList();
        if (walletsWithBalance.Count > 0)
        {
            if (string.IsNullOrWhiteSpace(request.BankAccountHolderName)
                || string.IsNullOrWhiteSpace(request.BankName)
                || string.IsNullOrWhiteSpace(request.Iban)
                || string.IsNullOrWhiteSpace(request.SwiftCode))
            {
                return BadRequest("Bank account details are required before deleting your profile.");
            }

            var normalizedIban = request.Iban.Replace(" ", string.Empty).Trim();
            if (normalizedIban.Length < 12)
            {
                return BadRequest("IBAN is invalid.");
            }

            if (request.SwiftCode.Trim().Length < 8)
            {
                return BadRequest("SWIFT code is invalid.");
            }

            var ibanLast4 = normalizedIban.Length >= 4
                ? normalizedIban.Substring(normalizedIban.Length - 4)
                : normalizedIban;

            foreach (var wallet in walletsWithBalance)
            {
                _db.Transactions.Add(new ExchangeTransaction
                {
                    TransactionID = Guid.NewGuid(),
                    UserID = userId,
                    TypeOfTransaction = "BankTransferOut",
                    Currency = wallet.Currency,
                    Amount = wallet.Balance,
                    Status = "Completed",
                    BlockchainTransactionHash = $"BANK-{ibanLast4}",
                    TimeStamp = DateTime.UtcNow
                });

                wallet.Balance = 0m;
            }
        }

        var deletedMarker = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");
        user.Email = $"deleted_{user.Id}_{deletedMarker}@deleted.local";
        user.UserName = $"deleted_{deletedMarker}";
        user.Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N"));
        user.Role = "DeletedUser";
        user.IsBanned = true;
        user.Status = NetServer.Data.Models.User.StatusBit.Inactive;
        user.ProfilePictureUrl = null;

        _db.SaveChanges();
        return Ok("Account deactivated successfully.");
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthSensitive")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errs = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .Distinct()
                .ToList();
            return BadRequest(new { errors = errs });
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = _db.Users.FirstOrDefault(u => u.Email.ToLower() == normalizedEmail);

        if (user != null)
        {
            var resetToken = CreatePasswordResetToken(user);
            var frontendBaseUrl = _config["Frontend:BaseUrl"];
            if (string.IsNullOrWhiteSpace(frontendBaseUrl))
            {
                // If no configured frontend URL, derive from the current request (avoids hardcoded localhost fallbacks)
                frontendBaseUrl = $"{Request.Scheme}://{Request.Host.Value}";
            }
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
    [EnableRateLimiting("AuthSensitive")]
    public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errs = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage)
                .Where(msg => !string.IsNullOrWhiteSpace(msg))
                .Distinct()
                .ToList();
            return BadRequest(new { errors = errs });
        }

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
        _db.Sessions.RemoveRange(_db.Sessions.Where(s => s.UserId == user.Id));
        _db.SaveChanges();

        return Ok("Password has been reset successfully.");
    }

    private string CreatePasswordResetToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("purpose", "password_reset"),
            new Claim("password_version", PasswordVersion(user.Password))
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

            var userIdValue = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var passwordVersion = principal.FindFirstValue("password_version");
            if (!Guid.TryParse(userIdValue, out var userId) || string.IsNullOrWhiteSpace(passwordVersion))
            {
                return null;
            }

            var currentPasswordHash = _db.Users
                .Where(u => u.Id == userId)
                .Select(u => u.Password)
                .FirstOrDefault();
            if (currentPasswordHash == null ||
                !CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(passwordVersion),
                    Encoding.UTF8.GetBytes(PasswordVersion(currentPasswordHash))))
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

    private static string PasswordVersion(string passwordHash) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(passwordHash)));

    private static bool VerifyPassword(string providedPassword, string storedPassword, out bool shouldUpgradePasswordHash)
    {
        shouldUpgradePasswordHash = false;

        if (string.IsNullOrWhiteSpace(storedPassword))
        {
            return false;
        }

        try
        {
            return BCrypt.Net.BCrypt.Verify(providedPassword, storedPassword);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            var matchesLegacyPlainText = string.Equals(providedPassword, storedPassword, StringComparison.Ordinal);
            shouldUpgradePasswordHash = matchesLegacyPlainText;
            return matchesLegacyPlainText;
        }
    }

    private static bool IsAtLeast18(DateTime dateOfBirth)
    {
        var today = DateTime.UtcNow.Date;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age))
        {
            age--;
        }

        return age >= 18;
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
    [RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = "";

    [Required]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$", ErrorMessage = "Password must be at least 8 characters and include an uppercase letter, a number and a special character")]
    public string Password { get; set; } = "";

    public string? Role { get; set; }

    public string FullName { get; set; } = "";
    public string IdNumber { get; set; } = "";
    public DateTime? DateOfBirth { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string Country { get; set; } = "";
    public string? DocumentType { get; set; }
    public string? IdFilePath { get; set; }

    // New: bank account currencies user wants to create at registration, e.g. ["USD"] or ["EUR"] or ["USD","EUR"]
    public string[]? BankAccountCurrencies { get; set; }

    // New: initial crypto wallets to create, e.g. ["USDT","BTC"]. If omitted, no crypto wallets are created by default.
    public string[]? InitialCryptoCurrencies { get; set; }
}

public class RegisterAdminRequest
{
    [Required]
    public string UserName { get; set; } = "";

    [Required]
    [RegularExpression(@"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$", ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = "";

    [Required]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$", ErrorMessage = "Password must be at least 8 characters and include an uppercase letter, a number and a special character")]
    public string Password { get; set; } = "";
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";

    public bool RememberMe { get; set; }
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

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = "";

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = "";
}

public class DeleteAccountRequest
{
    [Required]
    public string CurrentPassword { get; set; } = "";

    public string? BankAccountHolderName { get; set; }
    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? SwiftCode { get; set; }
}
