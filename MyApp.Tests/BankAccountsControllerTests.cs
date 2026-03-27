using System.Collections;
using Microsoft.AspNetCore.Mvc;
using NetServer.Data.Models;

namespace MyApp.Tests;

public class BankAccountsControllerTests
{
    [Test]
    public async Task Get_ReturnsUnauthorized_WhenNoUserClaim()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, null);

        var result = await controller.Get(null);

        Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
    }

    [Test]
    public async Task Get_NonAdmin_IgnoresRequestedUserId_AndReturnsOnlyOwnAccounts()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        db.BankAccounts.AddRange(
            new BankAccountTable
            {
                BankAccountId = Guid.NewGuid(),
                UserId = currentUserId,
                AccountHolderName = "Alice",
                BankName = "Bank A",
                Iban = "BG11TEST000000000001",
                SwiftCode = "TESTBGS1",
                Currency = "USD",
                CreatedAt = DateTime.UtcNow
            },
            new BankAccountTable
            {
                BankAccountId = Guid.NewGuid(),
                UserId = otherUserId,
                AccountHolderName = "Bob",
                BankName = "Bank B",
                Iban = "BG22TEST000000000002",
                SwiftCode = "TESTBGS2",
                Currency = "EUR",
                CreatedAt = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.Get(otherUserId);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var accounts = ((IEnumerable)ok!.Value!).Cast<object>().ToList();
        Assert.That(accounts, Has.Count.EqualTo(1));
        Assert.That(GetProperty<string>(accounts[0], "Iban"), Is.EqualTo("BG11TEST000000000001"));
        Assert.That(GetProperty<string>(accounts[0], "Currency"), Is.EqualTo("USD"));
    }

    [Test]
    public async Task Get_AdminCanReadRequestedUsersAccounts()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var adminUserId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        db.BankAccounts.AddRange(
            new BankAccountTable
            {
                BankAccountId = Guid.NewGuid(),
                UserId = targetUserId,
                AccountHolderName = "Target",
                BankName = "Target Bank",
                Iban = "BG33TEST000000000003",
                SwiftCode = "TESTBGS3",
                Currency = "USD",
                CreatedAt = DateTime.UtcNow
            },
            new BankAccountTable
            {
                BankAccountId = Guid.NewGuid(),
                UserId = otherUserId,
                AccountHolderName = "Other",
                BankName = "Other Bank",
                Iban = "BG44TEST000000000004",
                SwiftCode = "TESTBGS4",
                Currency = "EUR",
                CreatedAt = DateTime.UtcNow
            });
        await db.SaveChangesAsync();

        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, adminUserId, isAdmin: true);

        var result = await controller.Get(targetUserId);

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var accounts = ((IEnumerable)ok!.Value!).Cast<object>().ToList();
        Assert.That(accounts, Has.Count.EqualTo(1));
        Assert.That(GetProperty<string>(accounts[0], "Iban"), Is.EqualTo("BG33TEST000000000003"));
    }

    [Test]
    public async Task Create_ReturnsForbid_WhenNonAdminTargetsDifferentUser()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.Create(new BankAccountTable
        {
            UserId = targetUserId,
            AccountHolderName = "Alice",
            BankName = "Demo Bank",
            Iban = "BG55TEST000000000005",
            SwiftCode = "TESTBGS5",
            Currency = "eur"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
        Assert.That(db.BankAccounts, Is.Empty);
    }

    [Test]
    public async Task Create_DefaultsToCurrentUser_AndNormalizesCurrency()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.Create(new BankAccountTable
        {
            AccountHolderName = "Alice",
            BankName = "Demo Bank",
            Iban = "BG66TEST000000000006",
            SwiftCode = "TESTBGS6",
            Currency = "eur"
        });

        var created = result as CreatedAtActionResult;
        Assert.That(created, Is.Not.Null);

        var saved = db.BankAccounts.Single();
        Assert.That(saved.UserId, Is.EqualTo(currentUserId));
        Assert.That(saved.Currency, Is.EqualTo("EUR"));
        Assert.That(saved.AccountHolderName, Is.EqualTo("Alice"));
    }

    [Test]
    public async Task Update_ReturnsForbid_WhenNonAdminUpdatesAnotherUsersAccount()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var ownerUserId = Guid.NewGuid();
        var currentUserId = Guid.NewGuid();
        var account = new BankAccountTable
        {
            BankAccountId = Guid.NewGuid(),
            UserId = ownerUserId,
            AccountHolderName = "Owner",
            BankName = "Owner Bank",
            Iban = "BG77TEST000000000007",
            SwiftCode = "TESTBGS7",
            Currency = "USD",
            CreatedAt = DateTime.UtcNow
        };
        db.BankAccounts.Add(account);
        await db.SaveChangesAsync();

        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.Update(account.BankAccountId, new BankAccountTable
        {
            Currency = "eur"
        });

        Assert.That(result, Is.InstanceOf<ForbidResult>());
        Assert.That(db.BankAccounts.Single().Currency, Is.EqualTo("USD"));
    }

    [Test]
    public async Task Update_UpdatesFields_AndUppercasesCurrency_WhenOwner()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var account = new BankAccountTable
        {
            BankAccountId = Guid.NewGuid(),
            UserId = currentUserId,
            AccountHolderName = "Alice",
            BankName = "Bank A",
            Iban = "BG88TEST000000000008",
            SwiftCode = "TESTBGS8",
            Currency = "USD",
            CreatedAt = DateTime.UtcNow
        };
        db.BankAccounts.Add(account);
        await db.SaveChangesAsync();

        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.Update(account.BankAccountId, new BankAccountTable
        {
            AccountHolderName = "Alice Updated",
            BankName = "Bank B",
            Iban = "BG99TEST000000000009",
            SwiftCode = "TESTBGS9",
            Currency = "eur"
        });

        var ok = result as OkObjectResult;
        Assert.That(ok, Is.Not.Null);

        var saved = db.BankAccounts.Single();
        Assert.That(saved.AccountHolderName, Is.EqualTo("Alice Updated"));
        Assert.That(saved.BankName, Is.EqualTo("Bank B"));
        Assert.That(saved.Iban, Is.EqualTo("BG99TEST000000000009"));
        Assert.That(saved.SwiftCode, Is.EqualTo("TESTBGS9"));
        Assert.That(saved.Currency, Is.EqualTo("EUR"));
    }

    [Test]
    public async Task Delete_ReturnsNoContent_WhenOwnerDeletesOwnAccount()
    {
        using var db = ControllerTestHelpers.CreateDbContext();
        var currentUserId = Guid.NewGuid();
        var account = new BankAccountTable
        {
            BankAccountId = Guid.NewGuid(),
            UserId = currentUserId,
            AccountHolderName = "Alice",
            BankName = "Bank A",
            Iban = "BG10TEST000000000010",
            SwiftCode = "TESTBGS0",
            Currency = "USD",
            CreatedAt = DateTime.UtcNow
        };
        db.BankAccounts.Add(account);
        await db.SaveChangesAsync();

        var controller = new BankAccountsController(db);
        ControllerTestHelpers.SetUser(controller, currentUserId, isAdmin: false);

        var result = await controller.Delete(account.BankAccountId);

        Assert.That(result, Is.InstanceOf<NoContentResult>());
        Assert.That(db.BankAccounts, Is.Empty);
    }

    private static T GetProperty<T>(object value, string propertyName)
    {
        var property = value.GetType().GetProperty(propertyName);
        Assert.That(property, Is.Not.Null, $"Property '{propertyName}' was not found.");
        return (T)property!.GetValue(value)!;
    }
}
