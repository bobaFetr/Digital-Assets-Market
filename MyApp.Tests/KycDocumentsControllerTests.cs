using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class KycDocumentsControllerTests
{
    [Test]
    public async Task GetStatus_ReturnsTrue_WhenCurrentUserHasVerifiedDocument()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        db.KycDocuments.Add(new KycDocument
        {
            DocId = Guid.NewGuid(),
            UserId = currentUserId,
            Type = "Passport",
            FilePath = "id.png",
            DocumentNumber = "BG12345",
            FullName = "Alice Test",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            CountryOfResidence = "BG",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = "Verified",
            UploadedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.GetStatus();

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var verified = (bool)ok!.Value!.GetType().GetProperty("verified")!.GetValue(ok.Value)!;
        Assert.That(verified, Is.True);
    }

    [Test]
    public async Task CreateDocument_ReturnsBadRequest_WhenUserIsUnder18()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.CreateDocument(new CreateKycDocumentRequest
        {
            Type = "Passport",
            FilePath = "id.png",
            DocumentNumber = "BG12345",
            FullName = "Alice Test",
            DateOfBirth = DateTime.UtcNow.AddYears(-17),
            CountryOfResidence = "BG",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = "Verified"
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("User must be at least 18 years old."));
    }

    [Test]
    public async Task CreateDocument_DefaultsToCurrentUser_AndNormalizesTextFields()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.CreateDocument(new CreateKycDocumentRequest
        {
            Type = "  Passport  ",
            FilePath = "  id.png  ",
            DocumentNumber = "  BG12345  ",
            FullName = "  Alice Test  ",
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            CountryOfResidence = "  BG  ",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = "  Verified  "
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var saved = db.KycDocuments.Single();
        Assert.That(saved.UserId, Is.EqualTo(currentUserId));
        Assert.That(saved.Type, Is.EqualTo("Passport"));
        Assert.That(saved.FilePath, Is.EqualTo("id.png"));
        Assert.That(saved.DocumentNumber, Is.EqualTo("BG12345"));
        Assert.That(saved.FullName, Is.EqualTo("Alice Test"));
        Assert.That(saved.CountryOfResidence, Is.EqualTo("BG"));
        Assert.That(saved.Status, Is.EqualTo("Verified"));
        Assert.That(saved.DateOfBirth.Kind, Is.EqualTo(DateTimeKind.Utc));
        Assert.That(saved.ExpiryDate.Kind, Is.EqualTo(DateTimeKind.Utc));
    }

    [Test]
    public async Task UpdateDocument_ReturnsForbid_WhenNonOwnerUpdatesDifferentUsersDocument()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var doc = new KycDocument
        {
            DocId = Guid.NewGuid(),
            UserId = otherUserId,
            Type = "Passport",
            FilePath = "id.png",
            DocumentNumber = "BG12345",
            FullName = "Other User",
            DateOfBirth = DateTime.UtcNow.AddYears(-30),
            CountryOfResidence = "BG",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = "Pending",
            UploadedAt = DateTime.UtcNow
        };
        db.KycDocuments.Add(doc);
        await db.SaveChangesAsync();

        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.UpdateDocument(doc.DocId, new UpdateKycDocumentRequest
        {
            Status = "Verified"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }
}
