using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyWebApi.Services;
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

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var isVerified = await _db.KycDocuments.AsNoTracking().AnyAsync(d =>
            d.UserId == currentUserId && d.Status == "Verified");

        return Ok(new { verified = isVerified });
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

        if (request.DateOfBirth == default)
        {
            return BadRequest("Date of birth is required.");
        }

        // Normalize incoming dates to UTC to satisfy PostgreSQL timestamptz requirements
        var dobUtc = DateTime.SpecifyKind(request.DateOfBirth, DateTimeKind.Utc);
        var expiryUtc = request.ExpiryDate == default ? default : DateTime.SpecifyKind(request.ExpiryDate, DateTimeKind.Utc);

        if (!IsAtLeast18(dobUtc))
        {
            return BadRequest("User must be at least 18 years old.");
        }

        var targetUserId = request.UserId ?? currentUserId;
        if (!IsAdmin() && targetUserId != currentUserId)
        {
            return Forbid();
        }

        if (!RequestSecurity.TryValidatePlainText(request.Type, "Type", out var type, out var typeError, 100))
        {
            return BadRequest(typeError);
        }

        if (!RequestSecurity.TryValidatePlainText(request.FilePath, "FilePath", out var filePath, out var filePathError, 500))
        {
            return BadRequest(filePathError);
        }

        if (!RequestSecurity.TryValidatePlainText(request.DocumentNumber, "DocumentNumber", out var documentNumber, out var documentNumberError, 100))
        {
            return BadRequest(documentNumberError);
        }

        if (!RequestSecurity.TryValidatePlainText(request.FullName, "FullName", out var fullName, out var fullNameError, 200))
        {
            return BadRequest(fullNameError);
        }

        if (!RequestSecurity.TryValidatePlainText(request.CountryOfResidence, "CountryOfResidence", out var countryOfResidence, out var countryError, 100))
        {
            return BadRequest(countryError);
        }

        if (!RequestSecurity.TryValidatePlainText(request.Status, "Status", out var status, out var statusError, 50))
        {
            return BadRequest(statusError);
        }

        var doc = new KycDocument
        {
            DocId = Guid.NewGuid(),
            UserId = targetUserId,
            Type = type,
            FilePath = filePath,
            DocumentNumber = documentNumber,
            FullName = fullName,
            DateOfBirth = dobUtc,
            CountryOfResidence = countryOfResidence,
            ExpiryDate = expiryUtc,
            Status = IsAdmin() && !string.IsNullOrWhiteSpace(status) ? status : "Pending",
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
            if (!RequestSecurity.TryValidatePlainText(request.Type, "Type", out var type, out var typeError, 100))
            {
                return BadRequest(typeError);
            }

            doc.Type = type;
        }

        if (request.FilePath != null)
        {
            if (!RequestSecurity.TryValidatePlainText(request.FilePath, "FilePath", out var filePath, out var filePathError, 500))
            {
                return BadRequest(filePathError);
            }

            doc.FilePath = filePath;
        }

        if (request.DocumentNumber != null)
        {
            if (!RequestSecurity.TryValidatePlainText(request.DocumentNumber, "DocumentNumber", out var documentNumber, out var documentNumberError, 100))
            {
                return BadRequest(documentNumberError);
            }

            doc.DocumentNumber = documentNumber;
        }

        if (request.FullName != null)
        {
            if (!RequestSecurity.TryValidatePlainText(request.FullName, "FullName", out var fullName, out var fullNameError, 200))
            {
                return BadRequest(fullNameError);
            }

            doc.FullName = fullName;
        }

        if (request.DateOfBirth.HasValue)
        {
            if (!IsAtLeast18(request.DateOfBirth.Value))
            {
                return BadRequest("User must be at least 18 years old.");
            }

            doc.DateOfBirth = DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc);
        }

        if (request.CountryOfResidence != null)
        {
            if (!RequestSecurity.TryValidatePlainText(request.CountryOfResidence, "CountryOfResidence", out var countryOfResidence, out var countryError, 100))
            {
                return BadRequest(countryError);
            }

            doc.CountryOfResidence = countryOfResidence;
        }

        if (request.ExpiryDate.HasValue)
        {
            doc.ExpiryDate = DateTime.SpecifyKind(request.ExpiryDate.Value, DateTimeKind.Utc);
        }

        if (request.Status != null)
        {
            if (!IsAdmin())
            {
                return Forbid();
            }

            if (!RequestSecurity.TryValidatePlainText(request.Status, "Status", out var status, out var statusError, 50))
            {
                return BadRequest(statusError);
            }

            doc.Status = status;
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
            FullName = doc.FullName,
            DateOfBirth = doc.DateOfBirth,
            CountryOfResidence = doc.CountryOfResidence,
            ExpiryDate = doc.ExpiryDate,
            Status = doc.Status,
            UploadedAt = doc.UploadedAt
        };
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
