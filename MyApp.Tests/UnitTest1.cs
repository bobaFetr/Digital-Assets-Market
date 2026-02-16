using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MyApp.Tests;

public class ApiControllerBaseTests
{
    private sealed class TestController : ApiControllerBase
    {
        public void SetUser(ClaimsPrincipal user)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        public bool CallTryGetUserId(out Guid userId) => TryGetUserId(out userId);
        public bool CallIsAdmin() => IsAdmin();
    }

    [Test]
    public void TryGetUserId_ReturnsTrue_WhenClaimIsValidGuid()
    {
        var controller = new TestController();
        var userId = Guid.NewGuid();
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));

        controller.SetUser(user);

        var result = controller.CallTryGetUserId(out var parsedId);

        Assert.That(result, Is.True);
        Assert.That(parsedId, Is.EqualTo(userId));
    }

    [Test]
    public void TryGetUserId_ReturnsFalse_WhenClaimIsMissing()
    {
        var controller = new TestController();
        var user = new ClaimsPrincipal(new ClaimsIdentity(Array.Empty<Claim>(), "Test"));

        controller.SetUser(user);

        var result = controller.CallTryGetUserId(out var parsedId);

        Assert.That(result, Is.False);
        Assert.That(parsedId, Is.EqualTo(Guid.Empty));
    }

    [Test]
    public void TryGetUserId_ReturnsFalse_WhenClaimIsInvalidGuid()
    {
        var controller = new TestController();
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "not-a-guid") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));

        controller.SetUser(user);

        var result = controller.CallTryGetUserId(out var parsedId);

        Assert.That(result, Is.False);
        Assert.That(parsedId, Is.EqualTo(Guid.Empty));
    }

    [Test]
    public void IsAdmin_ReturnsTrue_WhenUserIsInAdminRole()
    {
        var controller = new TestController();
        var claims = new[] { new Claim(ClaimTypes.Role, "Admin") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test", ClaimTypes.Name, ClaimTypes.Role));

        controller.SetUser(user);

        var result = controller.CallIsAdmin();

        Assert.That(result, Is.True);
    }

    [Test]
    public void IsAdmin_ReturnsFalse_WhenUserIsNotInAdminRole()
    {
        var controller = new TestController();
        var claims = new[] { new Claim(ClaimTypes.Role, "User") };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test", ClaimTypes.Name, ClaimTypes.Role));

        controller.SetUser(user);

        var result = controller.CallIsAdmin();

        Assert.That(result, Is.False);
    }
}