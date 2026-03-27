using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class SessionsControllerTests
{
    [Test]
    public async Task GetSessions_NonAdmin_SeesOnlyOwnSessions()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var user1 = Guid.NewGuid();
        var user2 = Guid.NewGuid();

        db.Sessions.AddRange(
            new SessionTable
            {
                SessionId = Guid.NewGuid(),
                UserId = user1,
                Token = "token-1",
                IpAddress = "127.0.0.1",
                DeviceInfo = "Chrome",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            },
            new SessionTable
            {
                SessionId = Guid.NewGuid(),
                UserId = user2,
                Token = "token-2",
                IpAddress = "127.0.0.2",
                DeviceInfo = "Firefox",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            });
        await db.SaveChangesAsync();

        var controller = new SessionsController(db);
        ControllerTestHelpers.SetUser(controller, user1, isAdmin: false);

        var result = await controller.GetSessions(user2);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var sessions = ok!.Value as IEnumerable<SessionDto>;
        Assert.That(sessions, Is.Not.Null);
        Assert.That(sessions!.Select(s => s.UserId).Distinct().Single(), Is.EqualTo(user1));
    }

    [Test]
    public async Task CreateSession_ReturnsForbid_WhenNonAdminTargetsDifferentUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var controller = new SessionsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.CreateSession(new CreateSessionRequest
        {
            UserId = targetUserId,
            Token = "token",
            IpAddress = "127.0.0.1",
            DeviceInfo = "Chrome"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
        Assert.That(db.Sessions, Is.Empty);
    }

    [Test]
    public async Task UpdateSession_UpdatesFields_WhenOwner()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var session = new SessionTable
        {
            SessionId = Guid.NewGuid(),
            UserId = currentUserId,
            Token = "token",
            IpAddress = "127.0.0.1",
            DeviceInfo = "Chrome",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        db.Sessions.Add(session);
        await db.SaveChangesAsync();

        var controller = new SessionsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);
        var newExpiry = DateTime.UtcNow.AddHours(4);

        var result = await controller.UpdateSession(session.SessionId, new UpdateSessionRequest
        {
            IpAddress = "10.0.0.1",
            DeviceInfo = "Edge",
            ExpiresAt = newExpiry
        });

        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        Assert.That(session.IpAddress, Is.EqualTo("10.0.0.1"));
        Assert.That(session.DeviceInfo, Is.EqualTo("Edge"));
        Assert.That(session.ExpiresAt, Is.EqualTo(newExpiry));
    }

    [Test]
    public async Task DeleteSession_ReturnsNoContent_WhenOwnerDeletesOwnSession()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var session = new SessionTable
        {
            SessionId = Guid.NewGuid(),
            UserId = currentUserId,
            Token = "token",
            IpAddress = "127.0.0.1",
            DeviceInfo = "Chrome",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };
        db.Sessions.Add(session);
        await db.SaveChangesAsync();

        var controller = new SessionsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.DeleteSession(session.SessionId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.Sessions, Is.Empty);
    }
}
