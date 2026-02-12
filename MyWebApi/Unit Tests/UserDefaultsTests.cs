using NetServer.Data.Models;
using Xunit;

namespace MyWebApi.Tests;

public class UserDefaultsTests
{
    [Fact]
    public void NewUser_UsesExpectedDefaults()
    {
        var user = new User();

        Assert.NotEqual(Guid.Empty, user.Id);
        Assert.Equal("User", user.Role);
        Assert.Equal(User.StatusBit.Active, user.Status);
        Assert.False(user.IsBanned);
        Assert.True((DateTime.UtcNow - user.CreatedAt).TotalMinutes < 1);
        Assert.Equal(string.Empty, user.UserName);
        Assert.Equal(string.Empty, user.Email);
        Assert.Equal(string.Empty, user.Password);
    }

    [Fact]
    public void UserConstructor_PreservesProvidedValues()
    {
        var id = Guid.NewGuid();
        var createdAt = new DateTime(2024, 10, 1, 10, 30, 0, DateTimeKind.Utc);

        var user = new User(id, createdAt);

        Assert.Equal(id, user.Id);
        Assert.Equal(createdAt, user.CreatedAt);
        Assert.Equal("User", user.Role);
        Assert.Equal(User.StatusBit.Active, user.Status);
    }
}
