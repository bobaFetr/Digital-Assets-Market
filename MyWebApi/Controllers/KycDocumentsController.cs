using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/kyc-documents")]
[Authorize]
public class KycDocumentsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public KycDocumentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments([FromQuery] Guid? userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.KycDocuments.AsNoTracking();

        if (IsAdmin())
        {
            if (userId.HasValue)
            {
                query = query.Where(d => d.UserId == userId.Value);
            }
        }
        else
        {
            query = query.Where(d => d.UserId == currentUserId);
        }

        var docs = await query.Select(d => ToDto(d)).ToListAsync();
        return Ok(docs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDocument(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var doc = await _db.KycDocuments.AsNoTracking().FirstOrDefaultAsync(d => d.DocId == id);
        if (doc == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && doc.UserId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(doc));
    }

    [HttpPost]
    public async Task<IActionResult> CreateDocument([FromBody] CreateKycDocumentRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var targetUserId = request.UserId ?? currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId)
        {
            return Forbid();
        }

        var doc = new KycDocument
        {
            DocId = Guid.NewGuid(),
            UserId = targetUserId,
            Type = request.Type,
            FilePath = request.FilePath,
            DocumentNumber = request.DocumentNumber,
            ExpiryDate = request.ExpiryDate,
            Status = request.Status,
            UploadedAt = DateTime.UtcNow
        };

        _db.KycDocuments.Add(doc);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDocument), new { id = doc.DocId }, ToDto(doc));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDocument(Guid id, [FromBody] UpdateKycDocumentRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var doc = await _db.KycDocuments.FirstOrDefaultAsync(d => d.DocId == id);
        if (doc == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && doc.UserId != currentUserId)
        {
            return Forbid();
        }

        if (request.Type != null)
        {
            doc.Type = request.Type;
        }

        if (request.FilePath != null)
        {
            doc.FilePath = request.FilePath;
        }

        if (request.DocumentNumber != null)
        {
            doc.DocumentNumber = request.DocumentNumber;
        }

        if (request.ExpiryDate.HasValue)
        {
            doc.ExpiryDate = request.ExpiryDate.Value;
        }

        if (request.Status != null)
        {
            doc.Status = request.Status;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(doc));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var doc = await _db.KycDocuments.FirstOrDefaultAsync(d => d.DocId == id);
        if (doc == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && doc.UserId != currentUserId)
        {
            return Forbid();
        }

        _db.KycDocuments.Remove(doc);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static KycDocumentDto ToDto(KycDocument doc)
    {
        return new KycDocumentDto
        {
            DocId = doc.DocId,
            UserId = doc.UserId,
            Type = doc.Type,
            FilePath = doc.FilePath,
            DocumentNumber = doc.DocumentNumber,
            ExpiryDate = doc.ExpiryDate,
            Status = doc.Status,
            UploadedAt = doc.UploadedAt
        };
    }
}
