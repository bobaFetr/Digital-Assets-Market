using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class ReferralsControllerTests
{
    [Test]
    public async Task GetReferrals_ReturnsForbid_WhenNonAdminFiltersAnotherUsersReferralData()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var controller = new ReferralsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetReferrals(otherUserId, null);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task GetReferral_ReturnsForbid_WhenUserIsNotPartOfReferral()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var referral = new Referral
        {
            ReferralId = Guid.NewGuid(),
            ReferrerId = Guid.NewGuid(),
            ReferredId = Guid.NewGuid(),
            BonusAmount = 25m,
            Timestamp = DateTime.UtcNow
        };
        db.Referrals.Add(referral);
        await db.SaveChangesAsync();

        var controller = new ReferralsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetReferral(referral.ReferralId);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task CreateReferral_ReturnsForbid_WhenNonAdminUsesDifferentReferrer()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var controller = new ReferralsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.CreateReferral(new CreateReferralRequest
        {
            ReferrerId = otherUserId,
            ReferredId = Guid.NewGuid(),
            BonusAmount = 10m
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task CreateReferral_CreatesReferral_WhenCurrentUserIsReferrer()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var referredUserId = Guid.NewGuid();
        var controller = new ReferralsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.CreateReferral(new CreateReferralRequest
        {
            ReferrerId = currentUserId,
            ReferredId = referredUserId,
            BonusAmount = 15m
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var saved = db.Referrals.Single();
        Assert.That(saved.ReferrerId, Is.EqualTo(currentUserId));
        Assert.That(saved.ReferredId, Is.EqualTo(referredUserId));
        Assert.That(saved.BonusAmount, Is.EqualTo(15m));
    }
}
