using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Services;
using NetServer.Data;
using NetServer.Data.Models;
using System.Text.RegularExpressions;
using System;
using System.Collections.Generic;

[ApiController]
[Route("api/faq")]
public class FaqController : ApiControllerBase
{
	private readonly AppDbContext _db;
	private static readonly string[] BlockedWords = new[]
{
    // ENGLISH
    "fuck","fck","fuk","fucc","f*ck",
    "fucking","fucker","motherfucker","mf",

    "shit","sh1t","sh*t","shyt",
    "bullshit","bs",

    "bitch","b1tch","b*tch","btch",
    "bitches",

    "ass","a$$","azz",
    "asshole","a$$hole",

    "dick","d1ck","dik","d*ck",
    "dickhead",

    "pussy","p*ssy","pusy",
    "cock","c*ck","cok",

    "bastard","b*stard","bast4rd",
    "slut","sl*t",
    "whore","w*ore","h0re",

    "damn","d*mn",
    "crap",

    "retard","ret4rd",

    "kill","kys","die","suicide",

    // BULGARIAN (Latin + Cyrillic)
    "kur","кyp","кур","к*р",
    "kurva","кypвa","курва",
    "eba","еба","ебa",
    "ebal","ебал",
    "ebati","ебати","eba ti",

    "майка ти","maikati",
    "майка ти да еба","maika ti da eba",

    "putka","путка","п*тка",
    "putko","путко",

    "gaz","гъз","г*з",
    "laino","лайно","л*йно",

    "tapak","тъпак",
    "idiot","идиот",
    "prostak","простак",

    "mrusnik","мръсник",
    "bokluk","боклук",

    "pedal","педал",
    "pedofil","педофил"
};
	public FaqController(AppDbContext db)
	{
		_db = db;
	}

	[HttpGet]
	[AllowAnonymous]
	public async Task<IActionResult> GetFaqs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
	{
        try
        {
		page = page < 1 ? 1 : page;
		pageSize = pageSize < 1 ? 20 : pageSize;
		if (pageSize > 100)
		{
			pageSize = 100;
		}

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
				QuestionImageUrl = f.QuestionImageUrl,
				Answer = f.Answer ?? string.Empty,
				CreatedAt = f.CreatedAt,
				UpdatedAt = f.UpdatedAt,
				AuthorId = f.AuthorId,
				AuthorUserName = author != null ? author.UserName : null,
				AuthorEmail = author != null ? author.Email : null,
				AuthorProfilePictureUrl = author != null ? (author.ProfilePictureUrl ?? "/OIP.webp") : "/OIP.webp",
				ReplyAuthorId = f.RepliedByUserId,
				ReplyAuthorUserName = replyAuthor != null
					? replyAuthor.UserName
					: (!string.IsNullOrWhiteSpace(f.Answer) && author != null ? author.UserName : null),
				ReplyAuthorEmail = replyAuthor != null
					? replyAuthor.Email
					: (!string.IsNullOrWhiteSpace(f.Answer) && author != null ? author.Email : null),
				ReplyAuthorProfilePictureUrl = replyAuthor != null
					? (replyAuthor.ProfilePictureUrl ?? "/OIP.webp")
					: (!string.IsNullOrWhiteSpace(f.Answer) && author != null ? (author.ProfilePictureUrl ?? "/OIP.webp") : "/OIP.webp")
			})
			.Skip((page - 1) * pageSize)
			.Take(pageSize)
			.ToListAsync();

		return Ok(faqs);
		}
		catch (Exception ex)
		{
			Console.Error.WriteLine($"GetFaqs exception: {ex}");
			return StatusCode(500, "Internal server error. Check server logs for details.");
		}
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

		if (!RequestSecurity.TryValidatePlainText(request.Question, "Question", out var question, out var questionError, 2000))
		{
			return BadRequest(questionError);
		}

		if (ContainsBlockedWords(question, out var blockedQuestionWords))
		{
			return BadRequest($"Your question contains blocked language: {string.Join(", ", blockedQuestionWords)}");
		}

		if (!RequestSecurity.TryValidateImageReference(request.QuestionImageUrl, "QuestionImageUrl", out var questionImageUrl, out var imageValidationError))
		{
			return BadRequest(imageValidationError);
		}

		var now = DateTime.UtcNow;
		var faq = new FAQ
		{
			FaqId = Guid.NewGuid(),
			Question = question,
			QuestionImageUrl = questionImageUrl,
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

		if (!RequestSecurity.TryValidatePlainText(request.Answer, "Answer", out var answer, out var answerError, 4000))
		{
			return BadRequest(answerError);
		}

		if (ContainsBlockedWords(answer, out var blockedAnswerWords))
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

		faq.Answer = answer;
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

		if (!RequestSecurity.TryValidatePlainText(request.Question, "Question", out var question, out var questionError, 2000))
		{
			return BadRequest(questionError);
		}

		string answer = string.Empty;
		if (!string.IsNullOrWhiteSpace(request.Answer))
		{
			if (!RequestSecurity.TryValidatePlainText(request.Answer, "Answer", out answer, out var answerError, 4000))
			{
				return BadRequest(answerError);
			}
		}

		if (ContainsBlockedWords(question, out var blockedQuestionWords))
		{
			return BadRequest($"Question contains blocked language: {string.Join(", ", blockedQuestionWords)}");
		}

		if (!string.IsNullOrWhiteSpace(answer) && ContainsBlockedWords(answer, out var blockedAnswerWords))
		{
			return BadRequest($"Answer contains blocked language: {string.Join(", ", blockedAnswerWords)}");
		}

		var now = DateTime.UtcNow;
		var faq = new FAQ
		{
			FaqId = Guid.NewGuid(),
			Question = question,
			Answer = answer,
			CreatedAt = now,
			UpdatedAt = now,
			PublishedAt = now,
			AuthorId = currentUserId,
			RepliedByUserId = string.IsNullOrWhiteSpace(answer) ? null : currentUserId,
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
			if (!RequestSecurity.TryValidatePlainText(request.Question, "Question", out var question, out var questionError, 2000))
			{
				return BadRequest(questionError);
			}

			if (ContainsBlockedWords(question, out var blockedQuestionWords))
			{
				return BadRequest($"Question contains blocked language: {string.Join(", ", blockedQuestionWords)}");
			}

			faq.Question = question;
		}

		if (request.Answer != null)
		{
			if (!RequestSecurity.TryValidatePlainText(request.Answer, "Answer", out var answer, out var answerError, 4000))
			{
				return BadRequest(answerError);
			}

			if (ContainsBlockedWords(answer, out var blockedAnswerWords))
			{
				return BadRequest($"Answer contains blocked language: {string.Join(", ", blockedAnswerWords)}");
			}

			faq.Answer = answer;
			faq.RepliedByUserId = string.IsNullOrWhiteSpace(answer) ? null : currentUserId;
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
			QuestionImageUrl = faq.QuestionImageUrl,
			Answer = faq.Answer ?? string.Empty,
			CreatedAt = faq.CreatedAt,
			UpdatedAt = faq.UpdatedAt,
			AuthorId = faq.AuthorId,
			ReplyAuthorId = faq.RepliedByUserId
		};
	}

	private static bool ContainsBlockedWords(string? text, out List<string> matches)
	{
		matches = new List<string>();
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
