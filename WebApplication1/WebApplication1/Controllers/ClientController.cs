using Microsoft.AspNetCore.Mvc;

namespace WebApplication1.Controllers
{
    public class ClientController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
