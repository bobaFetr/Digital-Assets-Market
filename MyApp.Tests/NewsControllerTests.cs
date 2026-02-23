using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class NewsControllerTests
{
    [Test]
    public async Task GetNews_ReturnsItemsSortedByPublishedAtDescending()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var author = Guid.NewGuid();

        db.News.AddRange(
            new NewsTable
            {
                NewsId = Guid.NewGuid(),
                Title = "Older",
                Content = "Old content",
                Author = author,
                CreatedBy = author,
                EditedBy = author,
                DeletedBy = author,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                EditedOn = DateTime.UtcNow.AddDays(-2),
                DeletedOn = DateTime.MinValue,
                PublishedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new NewsTable
            {
                NewsId = Guid.NewGuid(),
                Title = "Newer",
                Content = "New content",
                Author = author,
                CreatedBy = author,
                EditedBy = author,
                DeletedBy = author,
                CreatedAt = DateTime.UtcNow,
                EditedOn = DateTime.UtcNow,
                DeletedOn = DateTime.MinValue,
                PublishedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new NewsController(db);

        var result = await controller.GetNews();

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var items = ok!.Value as IEnumerable<NewsDto>;
        Assert.That(items, Is.Not.Null);
        Assert.That(items!.Select(i => i.Title).ToList(), Is.EqualTo(new[] { "Newer", "Older" }));
    }

    [Test]
    public async Task GetNewsItem_ReturnsNotFound_WhenItemMissing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new NewsController(db);

        var result = await controller.GetNewsItem(Guid.NewGuid());

        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task CreateNews_ReturnsUnauthorized_WhenNoUserClaim()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new NewsController(db);
        ControllerTestHelpers.SetUser(controller, null);

        var result = await controller.CreateNews(new CreateNewsRequest
        {
            Title = "Title",
            Content = "Content"
        });

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task CreateNews_ReturnsForbid_WhenUserIsNotAdmin()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new NewsController(db);
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid(), isAdmin: false);

        var result = await controller.CreateNews(new CreateNewsRequest
        {
            Title = "Title",
            Content = "Content"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task CreateNews_ReturnsBadRequest_WhenTitleOrContentMissing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new NewsController(db);
        ControllerTestHelpers.SetUser(controller, Guid.NewGuid(), isAdmin: true);

        var result = await controller.CreateNews(new CreateNewsRequest
        {
            Title = " ",
            Content = "content"
        });

        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    [Test]
    public async Task CreateNews_ReturnsCreatedAtAction_WhenAdminProvidesValidInput()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var adminId = Guid.NewGuid();
        db.Users.Add(ControllerTestHelpers.CreateUser(adminId, "admin@test.com", "Admin"));
        await db.SaveChangesAsync();

        var controller = new NewsController(db);
        ControllerTestHelpers.SetUser(controller, adminId, isAdmin: true);

        var result = await controller.CreateNews(new CreateNewsRequest
        {
            Title = "Breaking",
            Content = "Story"
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);
        Assert.That(created!.ActionName, Is.EqualTo("GetNewsItem"));
        Assert.That(db.News.Count(), Is.EqualTo(1));
    }
}
