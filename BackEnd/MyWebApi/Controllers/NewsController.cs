using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Services;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/news")]
public class NewsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public NewsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetNews()
    {
        try
        {
            var items = await _db.News
                .AsNoTracking()
                .OrderByDescending(n => n.PublishedAt)
                .Select(n => ToDto(n))
                .ToListAsync();

            return Ok(items);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"GetNews exception: {ex}");
            return StatusCode(500, "Internal server error. Check server logs for details.");
        }
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNewsItem(Guid id)
    {
        try
        {
            var item = await _db.News
                .AsNoTracking()
                .FirstOrDefaultAsync(n => n.NewsId == id);

            if (item == null)
            {
                return NotFound();
            }

            return Ok(ToDto(item));
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"GetNewsItem exception: {ex}");
            return StatusCode(500, "Internal server error. Check server logs for details.");
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateNews([FromBody] CreateNewsRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        if (!IsAdmin())
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest("Title and content are required.");
        }

        if (!RequestSecurity.TryValidatePlainText(request.Title, "Title", out var title, out var titleError, 200))
        {
            return BadRequest(titleError);
        }

        if (!RequestSecurity.TryValidatePlainText(request.Content, "Content", out var content, out var contentError, 10000))
        {
            return BadRequest(contentError);
        }

        var now = DateTime.UtcNow;
        var news = new NewsTable
        {
            NewsId = Guid.NewGuid(),
            Title = title,
            Content = content,
            Author = currentUserId,
            PublishedAt = request.PublishedAt ?? now,
            CreatedAt = now,
            CreatedBy = currentUserId,
            EditedBy = currentUserId,
            EditedOn = now,
            DeletedBy = currentUserId,
            DeletedOn = DateTime.MinValue,
            UpdatedAt = now
        };

        _db.News.Add(news);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetNewsItem), new { id = news.NewsId }, ToDto(news));
    }

    private static NewsDto ToDto(NewsTable news)
    {
        return new NewsDto
        {
            NewsId = news.NewsId,
            Title = news.Title ?? string.Empty,
            Content = news.Content ?? string.Empty,
            Author = news.Author,
            PublishedAt = news.PublishedAt,
            UpdatedAt = news.UpdatedAt
        };
    }
}
