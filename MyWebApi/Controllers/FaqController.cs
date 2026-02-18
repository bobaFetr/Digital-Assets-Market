using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/faq")]
public class FaqController : ApiControllerBase
{
	private readonly AppDbContext _db;

	public FaqController(AppDbContext db)
	{
		_db = db;
	}

	[HttpGet]
	[AllowAnonymous]
	public async Task<IActionResult> GetFaqs()
	{
		var faqs = await _db.FAQs
			.AsNoTracking()
			.OrderByDescending(f => f.CreatedAt)
			.Select(f => ToDto(f))
			.ToListAsync();

		return Ok(faqs);
	}

	[HttpPost("questions")]
	[Authorize]
	public async Task<IActionResult> AskQuestion([FromBody] CreateFaqQuestionRequest request)
	{
		if (!TryGetUserId(out var currentUserId))
		{
			return Unauthorized();
		}

		if (string.IsNullOrWhiteSpace(request.Question))
		{
			return BadRequest("Question is required.");
		}

		var now = DateTime.UtcNow;
		var faq = new FAQ
		{
			FaqId = Guid.NewGuid(),
			Question = request.Question.Trim(),
			Answer = string.Empty,
			CreatedAt = now,
			UpdatedAt = now,
			PublishedAt = now,
			AuthorId = currentUserId,
			CategoryId = request.CategoryId ?? Guid.Empty
		};

		_db.FAQs.Add(faq);
		await _db.SaveChangesAsync();

		return CreatedAtAction(nameof(GetFaqs), new { id = faq.FaqId }, ToDto(faq));
	}

	[HttpPost("{id:guid}/replies")]
	[Authorize]
	public async Task<IActionResult> ReplyToQuestion(Guid id, [FromBody] ReplyFaqRequest request)
	{
		if (!TryGetUserId(out var currentUserId))
		{
			return Unauthorized();
		}

		if (string.IsNullOrWhiteSpace(request.Answer))
		{
			return BadRequest("Answer is required.");
		}

		var faq = await _db.FAQs.FirstOrDefaultAsync(f => f.FaqId == id);
		if (faq == null)
		{
			return NotFound();
		}

		if (faq.AuthorId == currentUserId)
		{
			return BadRequest("You cannot reply to your own question.");
		}

		faq.Answer = request.Answer.Trim();
		faq.UpdatedAt = DateTime.UtcNow;

		await _db.SaveChangesAsync();
		return Ok(ToDto(faq));
	}

	[HttpPost]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> CreateFaq([FromBody] CreateFaqRequest request)
	{
		if (!TryGetUserId(out var currentUserId))
		{
			return Unauthorized();
		}

		if (string.IsNullOrWhiteSpace(request.Question))
		{
			return BadRequest("Question is required.");
		}

		var now = DateTime.UtcNow;
		var faq = new FAQ
		{
			FaqId = Guid.NewGuid(),
			Question = request.Question.Trim(),
			Answer = request.Answer?.Trim() ?? string.Empty,
			CreatedAt = now,
			UpdatedAt = now,
			PublishedAt = now,
			AuthorId = currentUserId,
			CategoryId = request.CategoryId ?? Guid.Empty
		};

		_db.FAQs.Add(faq);
		await _db.SaveChangesAsync();

		return Ok(ToDto(faq));
	}

	[HttpPut("{id:guid}")]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> UpdateFaq(Guid id, [FromBody] UpdateFaqRequest request)
	{
		var faq = await _db.FAQs.FirstOrDefaultAsync(f => f.FaqId == id);
		if (faq == null)
		{
			return NotFound();
		}

		if (!string.IsNullOrWhiteSpace(request.Question))
		{
			faq.Question = request.Question.Trim();
		}

		if (request.Answer != null)
		{
			faq.Answer = request.Answer.Trim();
		}

		if (request.CategoryId.HasValue)
		{
			faq.CategoryId = request.CategoryId.Value;
		}

		faq.UpdatedAt = DateTime.UtcNow;
		await _db.SaveChangesAsync();

		return Ok(ToDto(faq));
	}

	[HttpDelete("{id:guid}")]
	[Authorize(Roles = "Admin")]
	public async Task<IActionResult> DeleteFaq(Guid id)
	{
		var faq = await _db.FAQs.FirstOrDefaultAsync(f => f.FaqId == id);
		if (faq == null)
		{
			return NotFound();
		}

		_db.FAQs.Remove(faq);
		await _db.SaveChangesAsync();

		return Ok();
	}

	private static FaqDto ToDto(FAQ faq)
	{
		return new FaqDto
		{
			FaqId = faq.FaqId,
			Question = faq.Question ?? string.Empty,
			Answer = faq.Answer ?? string.Empty,
			CreatedAt = faq.CreatedAt,
			UpdatedAt = faq.UpdatedAt,
			AuthorId = faq.AuthorId
		};
	}
}
