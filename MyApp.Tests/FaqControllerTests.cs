using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class FaqControllerTests
{
    [Test]
    public async Task GetFaqs_ReturnsPagedFaqs_WithAuthorAndReplyAuthorDetails()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var authorId = Guid.NewGuid();
        var replyAuthorId = Guid.NewGuid();
        db.Users.AddRange(
            ControllerTestHelpers.CreateUser(authorId, "author@test.com"),
            ControllerTestHelpers.CreateUser(replyAuthorId, "reply@test.com"));
        db.FAQs.Add(new FAQ
        {
            FaqId = Guid.NewGuid(),
            Question = "How do fees work?",
            QuestionImageUrl = "https://example.com/fees.png",
            Answer = "They are shown before submit.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PublishedAt = DateTime.UtcNow,
            AuthorId = authorId,
            RepliedByUserId = replyAuthorId,
            CategoryId = Guid.NewGuid()
        });
        await db.SaveChangesAsync();

        var controller = new FaqController(db);

        var result = await controller.GetFaqs(page: -2, pageSize: 500);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var faqs = ok!.Value as List<FaqDto>;
        Assert.That(faqs, Is.Not.Null);
        Assert.That(faqs, Has.Count.EqualTo(1));
        Assert.That(faqs![0].AuthorUserName, Is.EqualTo("author"));
        Assert.That(faqs[0].ReplyAuthorUserName, Is.EqualTo("reply"));
        Assert.That(faqs[0].AuthorProfilePictureUrl, Is.EqualTo("/OIP.webp"));
    }

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
    public async Task ReplyToQuestion_SavesAnswer_WhenDifferentUserReplies()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var authorId = Guid.NewGuid();
        var replyUserId = Guid.NewGuid();
        var faq = new FAQ
        {
            FaqId = Guid.NewGuid(),
            Question = "How do I verify my account?",
            Answer = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            PublishedAt = DateTime.UtcNow,
            AuthorId = authorId,
            CategoryId = Guid.NewGuid()
        };
        db.FAQs.Add(faq);
        await db.SaveChangesAsync();

        var controller = new FaqController(db);
        ControllerTestHelpers.SetUser(controller, replyUserId);

        var result = await controller.ReplyToQuestion(faq.FaqId, new ReplyFaqRequest
        {
            Answer = "Open your profile and upload your identity document."
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(faq.Answer, Is.EqualTo("Open your profile and upload your identity document."));
        Assert.That(faq.RepliedByUserId, Is.EqualTo(replyUserId));
    }

    [Test]
    public async Task CreateFaq_SavesAdminQuestionAndAnswer()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var adminId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var controller = new FaqController(db);
        ControllerTestHelpers.SetUser(controller, adminId, isAdmin: true);

        var result = await controller.CreateFaq(new CreateFaqRequest
        {
            Question = "  Can I withdraw EUR?  ",
            Answer = "  Yes, after verification.  ",
            CategoryId = categoryId
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var saved = db.FAQs.Single();
        Assert.That(saved.Question, Is.EqualTo("Can I withdraw EUR?"));
        Assert.That(saved.Answer, Is.EqualTo("Yes, after verification."));
        Assert.That(saved.AuthorId, Is.EqualTo(adminId));
        Assert.That(saved.RepliedByUserId, Is.EqualTo(adminId));
        Assert.That(saved.CategoryId, Is.EqualTo(categoryId));
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

    [Test]
    public async Task UpdateFaq_UpdatesQuestionAnswerAndCategory()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var adminUserId = Guid.NewGuid();
        var newCategoryId = Guid.NewGuid();
        var faq = new FAQ
        {
            FaqId = Guid.NewGuid(),
            Question = "Old question",
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
            Question = "Updated question",
            Answer = string.Empty,
            CategoryId = newCategoryId
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(faq.Question, Is.EqualTo("Updated question"));
        Assert.That(faq.Answer, Is.Empty);
        Assert.That(faq.RepliedByUserId, Is.Null);
        Assert.That(faq.CategoryId, Is.EqualTo(newCategoryId));
    }

    [Test]
    public async Task DeleteFaq_RemovesFaq()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var faq = new FAQ
        {
            FaqId = Guid.NewGuid(),
            Question = "Delete me",
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
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid(), isAdmin: true);

        var result = await controller.DeleteFaq(faq.FaqId);

        Assert.That(result, Is.InstanceOf<OkResult>());
        Assert.That(db.FAQs, Is.Empty);
    }
}
