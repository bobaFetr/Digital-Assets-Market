using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class KycDocumentsControllerTests
{
    [Test]
    public async Task GetDocuments_AdminCanFilterByUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var targetUserId = Guid.NewGuid();
        db.KycDocuments.AddRange(
            CreateDocument(targetUserId, "Target User", "Verified"),
            CreateDocument(Guid.NewGuid(), "Other User", "Pending"));
        await db.SaveChangesAsync();

        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid(), isAdmin: true);

        var result = await controller.GetDocuments(targetUserId);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var docs = ok!.Value as List<KycDocumentDto>;
        Assert.That(docs, Is.Not.Null);
        Assert.That(docs, Has.Count.EqualTo(1));
        Assert.That(docs![0].UserId, Is.EqualTo(targetUserId));
    }

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
    public async Task GetDocument_ReturnsForbid_WhenNonOwnerReadsDifferentUsersDocument()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var doc = CreateDocument(Guid.NewGuid(), "Other User", "Pending");
        db.KycDocuments.Add(doc);
        await db.SaveChangesAsync();

        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid());

        var result = await controller.GetDocument(doc.DocId);

        Assert.That(result, Is.InstanceOf<ForbidResult>());
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

    [Test]
    public async Task UpdateDocument_UpdatesAllProvidedFields()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var doc = CreateDocument(currentUserId, "Old User", "Pending");
        db.KycDocuments.Add(doc);
        await db.SaveChangesAsync();

        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId);
        var newDob = DateTime.UtcNow.AddYears(-30);
        var newExpiry = DateTime.UtcNow.AddYears(10);

        var result = await controller.UpdateDocument(doc.DocId, new UpdateKycDocumentRequest
        {
            Type = "  Identity Card  ",
            FilePath = "  updated.png  ",
            DocumentNumber = "  NEW123  ",
            FullName = "  New User  ",
            DateOfBirth = newDob,
            CountryOfResidence = "  Germany  ",
            ExpiryDate = newExpiry,
            Status = "  Verified  "
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(doc.Type, Is.EqualTo("Identity Card"));
        Assert.That(doc.FilePath, Is.EqualTo("updated.png"));
        Assert.That(doc.DocumentNumber, Is.EqualTo("NEW123"));
        Assert.That(doc.FullName, Is.EqualTo("New User"));
        Assert.That(doc.CountryOfResidence, Is.EqualTo("Germany"));
        Assert.That(doc.Status, Is.EqualTo("Verified"));
        Assert.That(doc.DateOfBirth.Kind, Is.EqualTo(DateTimeKind.Utc));
        Assert.That(doc.ExpiryDate.Kind, Is.EqualTo(DateTimeKind.Utc));
    }

    [Test]
    public async Task DeleteDocument_RemovesOwnedDocument()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var doc = CreateDocument(currentUserId, "Delete User", "Pending");
        db.KycDocuments.Add(doc);
        await db.SaveChangesAsync();

        var controller = new KycDocumentsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId);

        var result = await controller.DeleteDocument(doc.DocId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.KycDocuments, Is.Empty);
    }

    private static KycDocument CreateDocument(Guid userId, string fullName, string status)
    {
        return new KycDocument
        {
            DocId = Guid.NewGuid(),
            UserId = userId,
            Type = "Passport",
            FilePath = "id.png",
            DocumentNumber = "BG12345",
            FullName = fullName,
            DateOfBirth = DateTime.UtcNow.AddYears(-25),
            CountryOfResidence = "BG",
            ExpiryDate = DateTime.UtcNow.AddYears(5),
            Status = status,
            UploadedAt = DateTime.UtcNow
        };
    }
}
