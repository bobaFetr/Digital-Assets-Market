using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetServer.Data;
using NetServer.Data.Models;

[ApiController]
[Route("api/referrals")]
[Authorize]
public class ReferralsController : ApiControllerBase
{
    private readonly AppDbContext _db;

    public ReferralsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetReferrals([FromQuery] Guid? referrerId, [FromQuery] Guid? referredId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var query = _db.Referrals.AsNoTracking();

        if (IsAdmin())
        {
            if (referrerId.HasValue)
            {
                query = query.Where(r => r.ReferrerId == referrerId.Value);
            }

            if (referredId.HasValue)
            {
                query = query.Where(r => r.ReferredId == referredId.Value);
            }
        }
        else
        {
            query = query.Where(r => r.ReferrerId == currentUserId || r.ReferredId == currentUserId);

            if (referrerId.HasValue || referredId.HasValue)
            {
                if ((referrerId.HasValue && referrerId.Value != currentUserId) ||
                    (referredId.HasValue && referredId.Value != currentUserId))
                {
                    return Forbid();
                }
            }
        }

        var referrals = await query.Select(r => ToDto(r)).ToListAsync();
        return Ok(referrals);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetReferral(Guid id)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var referral = await _db.Referrals.AsNoTracking().FirstOrDefaultAsync(r => r.ReferralId == id);
        if (referral == null)
        {
            return NotFound();
        }

        if (!IsAdmin() && referral.ReferrerId != currentUserId && referral.ReferredId != currentUserId)
        {
            return Forbid();
        }

        return Ok(ToDto(referral));
    }

    [HttpPost]
    public async Task<IActionResult> CreateReferral([FromBody] CreateReferralRequest request)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        if (!IsAdmin() && request.ReferrerId != currentUserId)
        {
            return Forbid();
        }

        var referral = new Referral
        {
            ReferralId = Guid.NewGuid(),
            ReferrerId = request.ReferrerId,
            ReferredId = request.ReferredId,
            BonusAmount = request.BonusAmount,
            Timestamp = request.Timestamp ?? DateTime.UtcNow
        };

        _db.Referrals.Add(referral);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetReferral), new { id = referral.ReferralId }, ToDto(referral));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateReferral(Guid id, [FromBody] UpdateReferralRequest request)
    {
        var referral = await _db.Referrals.FirstOrDefaultAsync(r => r.ReferralId == id);
        if (referral == null)
        {
            return NotFound();
        }

        if (request.BonusAmount.HasValue)
        {
            referral.BonusAmount = request.BonusAmount.Value;
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(referral));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteReferral(Guid id)
    {
        var referral = await _db.Referrals.FirstOrDefaultAsync(r => r.ReferralId == id);
        if (referral == null)
        {
            return NotFound();
        }

        _db.Referrals.Remove(referral);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ReferralDto ToDto(Referral referral)
    {
        return new ReferralDto
        {
            ReferralId = referral.ReferralId,
            ReferrerId = referral.ReferrerId,
            ReferredId = referral.ReferredId,
            BonusAmount = referral.BonusAmount,
            Timestamp = referral.Timestamp
        };
    }
}
