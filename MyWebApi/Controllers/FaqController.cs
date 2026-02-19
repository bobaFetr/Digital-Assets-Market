using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;
using System.Text.RegularExpressions;

[ApiController]
[Route("api/faq")]
public class FaqController : ApiControllerBase
{
	private readonly AppDbContext _db;
	private static readonly string[] BlockedWords =
	[
		"badword1",
		"badword2",
		"badword3"
	];

	public FaqController(AppDbContext db)
	{
		_db = db;
	}

	[HttpGet]
	[AllowAnonymous]
	public async Task<IActionResult> GetFaqs()
	{
		var faqs = await (
			from f in _db.FAQs.AsNoTracking()
			join u in _db.Users.AsNoTracking() on f.AuthorId equals u.Id into users
			from author in users.DefaultIfEmpty()
			join ru in _db.Users.AsNoTracking() on f.RepliedByUserId equals ru.Id into replyUsers
			from replyAuthor in replyUsers.DefaultIfEmpty()
			orderby f.CreatedAt descending
			select new FaqDto
			{
				FaqId = f.FaqId,
				Question = f.Question ?? string.Empty,
				Answer = f.Answer ?? string.Empty,
				CreatedAt = f.CreatedAt,
				UpdatedAt = f.UpdatedAt,
				AuthorId = f.AuthorId,
				AuthorUserName = author != null ? author.UserName : null,
				AuthorEmail = author != null ? author.Email : null,
				AuthorProfilePictureUrl = author != null ? author.ProfilePictureUrl : null,
				ReplyAuthorId = f.RepliedByUserId,
				ReplyAuthorUserName = replyAuthor != null
					? replyAuthor.UserName
					: (!string.IsNullOrWhiteSpace(f.Answer) && author != null ? author.UserName : null),
				ReplyAuthorEmail = replyAuthor != null
					? replyAuthor.Email
					: (!string.IsNullOrWhiteSpace(f.Answer) && author != null ? author.Email : null),
				ReplyAuthorProfilePictureUrl = replyAuthor != null
					? replyAuthor.ProfilePictureUrl
					: (!string.IsNullOrWhiteSpace(f.Answer) && author != null ? author.ProfilePictureUrl : null)
			})
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

		if (ContainsBlockedWords(request.Question, out var blockedQuestionWords))
		{
			return BadRequest($"Your question contains blocked language: {string.Join(", ", blockedQuestionWords)}");
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

		if (ContainsBlockedWords(request.Answer, out var blockedAnswerWords))
		{
			return BadRequest($"Your reply contains blocked language: {string.Join(", ", blockedAnswerWords)}");
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
		faq.RepliedByUserId = currentUserId;
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

		if (ContainsBlockedWords(request.Question, out var blockedQuestionWords))
		{
			return BadRequest($"Question contains blocked language: {string.Join(", ", blockedQuestionWords)}");
		}

		if (!string.IsNullOrWhiteSpace(request.Answer) && ContainsBlockedWords(request.Answer, out var blockedAnswerWords))
		{
			return BadRequest($"Answer contains blocked language: {string.Join(", ", blockedAnswerWords)}");
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
			RepliedByUserId = string.IsNullOrWhiteSpace(request.Answer) ? null : currentUserId,
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
		if (!TryGetUserId(out var currentUserId))
		{
			return Unauthorized();
		}

		var faq = await _db.FAQs.FirstOrDefaultAsync(f => f.FaqId == id);
		if (faq == null)
		{
			return NotFound();
		}

		if (!string.IsNullOrWhiteSpace(request.Question))
		{
			if (ContainsBlockedWords(request.Question, out var blockedQuestionWords))
			{
				return BadRequest($"Question contains blocked language: {string.Join(", ", blockedQuestionWords)}");
			}

			faq.Question = request.Question.Trim();
		}

		if (request.Answer != null)
		{
			if (ContainsBlockedWords(request.Answer, out var blockedAnswerWords))
			{
				return BadRequest($"Answer contains blocked language: {string.Join(", ", blockedAnswerWords)}");
			}

			faq.Answer = request.Answer.Trim();
			faq.RepliedByUserId = string.IsNullOrWhiteSpace(request.Answer) ? null : currentUserId;
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
			AuthorId = faq.AuthorId,
			ReplyAuthorId = faq.RepliedByUserId
		};
	}

	private static bool ContainsBlockedWords(string? text, out List<string> matches)
	{
		matches = [];
		if (string.IsNullOrWhiteSpace(text))
		{
			return false;
		}

		foreach (var blockedWord in BlockedWords)
		{
			if (Regex.IsMatch(text, $@"\b{Regex.Escape(blockedWord)}\b", RegexOptions.IgnoreCase))
			{
				matches.Add(blockedWord);
			}
		}

		return matches.Count > 0;
	}
}
