using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
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
        var items = await _db.News
            .AsNoTracking()
            .OrderByDescending(n => n.PublishedAt)
            .Select(n => ToDto(n))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetNewsItem(Guid id)
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
