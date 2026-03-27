using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class AuditLogsControllerTests
{
    [Test]
    public async Task GetLogs_NonAdmin_SeesOnlyOwnLogs()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();

        db.AuditLogs.AddRange(
            new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = user1,
                Action = "Login",
                Details = "Own",
                Timestamp = DateTime.UtcNow
            },
            new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = user2,
                Action = "Login",
                Details = "Other",
                Timestamp = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new AuditLogsController(db);
        ControllerTestHelpers.SetUser(controller, user1, isAdmin: false);

        var result = await controller.GetLogs(user2);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);
        var logs = ok!.Value as IEnumerable<AuditLogDto>;
        Assert.That(logs, Is.Not.Null);
        Assert.That(logs!.Count(), Is.EqualTo(1));
        Assert.That(logs.Single().UserId, Is.EqualTo(user1));
    }

    [Test]
    public async Task CreateLog_ReturnsForbid_WhenNonAdminTargetsDifferentUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var controller = new AuditLogsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.CreateLog(new CreateAuditLogRequest
        {
            UserId = targetUserId,
            Action = "Login",
            Details = "Attempted"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    [Test]
    public async Task UpdateLog_UpdatesActionAndDetails_WhenLogExists()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var log = new AuditLog
        {
            LogId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = "Login",
            Details = "Before",
            Timestamp = DateTime.UtcNow
        };
        db.AuditLogs.Add(log);
        await db.SaveChangesAsync();

        var controller = new AuditLogsController(db);

        var result = await controller.UpdateLog(log.LogId, new UpdateAuditLogRequest
        {
            Action = "PasswordChange",
            Details = "After"
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(log.Action, Is.EqualTo("PasswordChange"));
        Assert.That(log.Details, Is.EqualTo("After"));
    }

    [Test]
    public async Task DeleteLog_ReturnsNoContent_WhenLogExists()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var log = new AuditLog
        {
            LogId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = "Login",
            Details = "Before",
            Timestamp = DateTime.UtcNow
        };
        db.AuditLogs.Add(log);
        await db.SaveChangesAsync();

        var controller = new AuditLogsController(db);

        var result = await controller.DeleteLog(log.LogId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.AuditLogs, Is.Empty);
    }
}
