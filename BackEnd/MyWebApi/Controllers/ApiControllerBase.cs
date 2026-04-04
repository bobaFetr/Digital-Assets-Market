using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
public abstract class ApiControllerBase : ControllerBase
{
    protected bool TryGetUserId(out Guid userId)
    {
        userId = Guid.Empty;
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out userId);
    }
    protected bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }

    //  protected bool IsAdmin()
    // {
    //     return User.IsInRole("Admin");
    // }
}