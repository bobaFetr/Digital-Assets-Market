using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyWebApi.Services;

[ApiController]
[Route("api/market")]
[AllowAnonymous]
public class MarketDataController : ControllerBase
{
    private readonly IMarketDataService _marketDataService;

    public MarketDataController(IMarketDataService marketDataService)
    {
        _marketDataService = marketDataService;
    }

    [HttpGet("symbols")]
    public IActionResult GetSupportedSymbols()
    {
        return Ok(_marketDataService.GetSupportedSymbols().OrderBy(symbol => symbol));
    }

    [HttpGet("ticker")]
    public async Task<IActionResult> GetTicker([FromQuery] string symbol)
    {
        var ticker = await _marketDataService.GetTickerAsync(symbol);
        if (ticker == null)
        {
            return NotFound("Market symbol not supported or market data unavailable.");
        }

        return Ok(ticker);
    }

    [HttpGet("depth")]
    public async Task<IActionResult> GetDepth([FromQuery] string symbol, [FromQuery] int limit = 20)
    {
        var depth = await _marketDataService.GetDepthAsync(symbol, limit);
        if (depth == null)
        {
            return NotFound("Market symbol not supported or market data unavailable.");
        }

        return Ok(depth);
    }

    [HttpGet("klines")]
    public async Task<IActionResult> GetKlines([FromQuery] string symbol, [FromQuery] string interval = "1m", [FromQuery] int limit = 120)
    {
        var klines = await _marketDataService.GetKlinesAsync(symbol, interval, limit);
        if (klines.Count == 0)
        {
            return NotFound("Market symbol not supported or market data unavailable.");
        }

        return Ok(klines);
    }
}
