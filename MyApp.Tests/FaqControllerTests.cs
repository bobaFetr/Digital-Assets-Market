using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class FaqControllerTests
{
    [Test]
    public async Task AskQuestion_ReturnsBadRequest_WhenQuestionContainsBlockedLanguage()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var controller = new FaqController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.AskQuestion(new CreateFaqQuestionRequest
        {
            Question = "This is shit",
            CategoryId = Guid.NewGuid()
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value!.ToString(), Does.Contain("blocked language"));
    }

    [Test]
    public async Task AskQuestion_CreatesFaq_WhenQuestionIsValid()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var controller = new FaqController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);
        var categoryId = Guid.NewGuid();

        var result = await controller.AskQuestion(new CreateFaqQuestionRequest
        {
            Question = "  How do I verify my account?  ",
            QuestionImageUrl = "https://example.com/image.png",
            CategoryId = categoryId
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var saved = db.FAQs.Single();
        Assert.That(saved.AuthorId, Is.EqualTo(currentUserId));
        Assert.That(saved.Question, Is.EqualTo("How do I verify my account?"));
        Assert.That(saved.QuestionImageUrl, Is.EqualTo("https://example.com/image.png"));
        Assert.That(saved.CategoryId, Is.EqualTo(categoryId));
    }

    [Test]
    public async Task ReplyToQuestion_ReturnsBadRequest_WhenAuthorRepliesToOwnQuestion()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var faq = new FAQ
        {
            FaqId = Guid.NewGuid(),
            Question = "How do I verify my account?",
            Answer = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PublishedAt = DateTime.UtcNow,
            AuthorId = currentUserId,
            CategoryId = Guid.NewGuid()
        };
        db.FAQs.Add(faq);
        await db.SaveChangesAsync();

        var controller = new FaqController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.ReplyToQuestion(faq.FaqId, new ReplyFaqRequest
        {
            Answer = "You can do that from settings."
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("You cannot reply to your own question."));
    }

    [Test]
    public async Task UpdateFaq_SetsReplyAuthor_WhenAdminAddsAnswer()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var adminUserId = Guid.NewGuid();
        var faq = new FAQ
        {
            FaqId = Guid.NewGuid(),
            Question = "How do I verify my account?",
            Answer = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PublishedAt = DateTime.UtcNow,
            AuthorId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid()
        };
        db.FAQs.Add(faq);
        await db.SaveChangesAsync();

        var controller = new FaqController(db);
        ControllerTestHelpers.SetUser(controller, adminUserId, isAdmin: true);

        var result = await controller.UpdateFaq(faq.FaqId, new UpdateFaqRequest
        {
            Answer = "Verification is available in your profile settings."
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(faq.Answer, Is.EqualTo("Verification is available in your profile settings."));
        Assert.That(faq.RepliedByUserId, Is.EqualTo(adminUserId));
    }
}
