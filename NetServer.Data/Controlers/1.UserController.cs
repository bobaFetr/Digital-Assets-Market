// using DigitalAssets.Api.Helpers;
// using Microsoft.AspNetCore.Mvc;
// using DigitalAssets.Api.Data;   
// using AppDBContext = DigitalAssets.Api.Data.AppDbContext;
// [ApiController]
// [Route("api/auth")]
// public class AuthController : ControllerBase
// {
//     public record RegisterDto(string Username, string Password);
//     public record LoginDto(string Username, string Password);

//     private readonly AppDbContext _context;

//     public AuthController(AppDbContext context)
//     {
//         _context = context;
//     }

//     [HttpPost("register")]
//     public async Task<IActionResult> Register(RegisterDto dto)
//     {
//         if (_context.Users.Any(u => u.Username == dto.Username))
//             return BadRequest("User already exists");

//         var user = new User
//         {
//             Username = dto.Username,
//             PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
//         };

//         _context.Users.Add(user);
//         await _context.SaveChangesAsync();

//         return Ok();
//     }

//     [HttpPost("login")]
//     public IActionResult Login(LoginDto dto)
//     {
//         var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username);
//         if (user == null)
//             return Unauthorized();

//         if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
//             return Unauthorized();

//         //var token = JwtHelpe
//         var token = JwtHelper.GenerateToken(user);

//         return Ok(new { token });
//     }
// }