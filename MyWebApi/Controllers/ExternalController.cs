using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

[ApiController]
[Route("api/external")]
public class ExternalController : ControllerBase
{
    private static readonly HttpClient _http = new HttpClient();

    [HttpGet("coingecko/{coinId}/market_chart")]
    public async Task<IActionResult> GetCoinGeckoMarketChart(string coinId, [FromQuery] string vs_currency = "usd", [FromQuery] int days = 1, [FromQuery] string interval = "hourly")
    {
        var target = $"https://api.coingecko.com/api/v3/coins/{coinId}/market_chart?vs_currency={vs_currency}&days={days}&interval={interval}";

        try
        {
            using var resp = await _http.GetAsync(target);
            var body = await resp.Content.ReadAsStringAsync();
            if (!resp.IsSuccessStatusCode)
            {
                return StatusCode((int)resp.StatusCode, body);
            }

            var contentType = resp.Content.Headers.ContentType?.ToString() ?? "application/json";
            return Content(body, contentType);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"CoinGecko proxy error: {ex}");
            return StatusCode(502, "Error fetching external market data.");
        }
    }
}
