using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class UsersControllerTests
{
    [Test]
    public async Task UpdateMyUserName_ReturnsBadRequest_WhenUsernameTakenByAnotherUser_CaseInsensitive()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();
        var otherId = Guid.NewGuid();

        db.Users.AddRange(
            new User
            {
                Id = callerId,
                UserName = "Caller",
                Email = "caller@test.com",
                Password = "hashed",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                Status = User.StatusBit.Active,
                IsBanned = false
            },
            new User
            {
                Id = otherId,
                UserName = "TakenName",
                Email = "taken@test.com",
                Password = "hashed",
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                Status = User.StatusBit.Active,
                IsBanned = false
            });
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.UpdateMyUserName(new UpdateUserNameRequest
        {
            UserName = "  takenname  "
        });

        var badRequest = result as BadRequestObjectResult;
        Assert.That(badRequest, Is.Not.Null);
        Assert.That(badRequest!.Value, Is.EqualTo("Username already exists."));
    }

    [Test]
    public async Task UpdateMyUserName_AllowsSameUsernameForCurrentUser_WithDifferentCasing()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var callerId = Guid.NewGuid();

        db.Users.Add(new User
        {
            Id = callerId,
            UserName = "MyName",
            Email = "caller@test.com",
            Password = "hashed",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            Status = User.StatusBit.Active,
            IsBanned = false
        });
        await db.SaveChangesAsync();

        var controller = new UsersController(db);
        ControllerTestHelpers.SetUser(controller, callerId, isAdmin: false);

        var result = await controller.UpdateMyUserName(new UpdateUserNameRequest
        {
            UserName = "  myname  "
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var saved = await db.Users.FindAsync(callerId);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved!.UserName, Is.EqualTo("myname"));
    }
}
