using System.Globalization;
using System.Text.Json;

namespace MyWebApi.Services;

public sealed class BinanceMarketDataService : IMarketDataService
{
    private static readonly IReadOnlyDictionary<string, string> SymbolMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["BTCUSD"] = "BTCUSDT",
        ["ETHUSD"] = "ETHUSDT",
        ["BNBUSD"] = "BNBUSDT",
        ["ALGOUSD"] = "ALGOUSDT",
        ["BTCEUR"] = "BTCEUR",
        ["ETHEUR"] = "ETHEUR",
        ["BNBEUR"] = "BNBEUR",
        ["ALGOEUR"] = "ALGOEUR"
    };

    private readonly HttpClient _httpClient;
    private readonly ILogger<BinanceMarketDataService> _logger;

    public BinanceMarketDataService(HttpClient httpClient, ILogger<BinanceMarketDataService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public bool TryMapSymbol(string appSymbol, out string marketSymbol)
    {
        return SymbolMap.TryGetValue((appSymbol ?? string.Empty).Trim().ToUpperInvariant(), out marketSymbol!);
    }

    public IReadOnlyCollection<string> GetSupportedSymbols()
    {
        return SymbolMap.Keys.ToArray();
    }

    public async Task<MarketTickerDto?> GetTickerAsync(string appSymbol, CancellationToken cancellationToken = default)
    {
        if (!TryMapSymbol(appSymbol, out var marketSymbol))
        {
            return null;
        }

        using var response = await _httpClient.GetAsync($"/api/v3/ticker/24hr?symbol={marketSymbol}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Binance ticker request failed for {MarketSymbol} with status {StatusCode}", marketSymbol, response.StatusCode);
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = document.RootElement;

        return new MarketTickerDto
        {
            Symbol = NormalizeSymbol(appSymbol),
            MarketSymbol = marketSymbol,
            LastPrice = ReadDecimal(root, "lastPrice"),
            BidPrice = ReadDecimal(root, "bidPrice"),
            AskPrice = ReadDecimal(root, "askPrice"),
            PriceChangePercent = ReadDecimal(root, "priceChangePercent"),
            AsOfUtc = DateTime.UtcNow
        };
    }

    public async Task<MarketDepthDto?> GetDepthAsync(string appSymbol, int limit = 20, CancellationToken cancellationToken = default)
    {
        if (!TryMapSymbol(appSymbol, out var marketSymbol))
        {
            return null;
        }

        var normalizedLimit = Math.Clamp(limit, 5, 100);
        using var response = await _httpClient.GetAsync($"/api/v3/depth?symbol={marketSymbol}&limit={normalizedLimit}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Binance depth request failed for {MarketSymbol} with status {StatusCode}", marketSymbol, response.StatusCode);
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = document.RootElement;

        return new MarketDepthDto
        {
            Symbol = NormalizeSymbol(appSymbol),
            MarketSymbol = marketSymbol,
            AsOfUtc = DateTime.UtcNow,
            Bids = ReadLevels(root, "bids"),
            Asks = ReadLevels(root, "asks")
        };
    }

    public async Task<IReadOnlyList<MarketCandleDto>> GetKlinesAsync(string appSymbol, string interval = "1m", int limit = 120, CancellationToken cancellationToken = default)
    {
        if (!TryMapSymbol(appSymbol, out var marketSymbol))
        {
            return Array.Empty<MarketCandleDto>();
        }

        var normalizedLimit = Math.Clamp(limit, 1, 1000);
        var normalizedInterval = string.IsNullOrWhiteSpace(interval) ? "1m" : interval.Trim();

        using var response = await _httpClient.GetAsync($"/api/v3/klines?symbol={marketSymbol}&interval={normalizedInterval}&limit={normalizedLimit}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Binance kline request failed for {MarketSymbol} with status {StatusCode}", marketSymbol, response.StatusCode);
            return Array.Empty<MarketCandleDto>();
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        var candles = new List<MarketCandleDto>();
        foreach (var row in document.RootElement.EnumerateArray())
        {
            candles.Add(new MarketCandleDto
            {
                Symbol = NormalizeSymbol(appSymbol),
                MarketSymbol = marketSymbol,
                OpenTimeUtc = DateTimeOffset.FromUnixTimeMilliseconds(row[0].GetInt64()).UtcDateTime,
                Open = ParseDecimal(row[1].GetString()),
                High = ParseDecimal(row[2].GetString()),
                Low = ParseDecimal(row[3].GetString()),
                Close = ParseDecimal(row[4].GetString()),
                Volume = ParseDecimal(row[5].GetString()),
                CloseTimeUtc = DateTimeOffset.FromUnixTimeMilliseconds(row[6].GetInt64()).UtcDateTime
            });
        }

        return candles;
    }

    private static string NormalizeSymbol(string appSymbol)
    {
        return (appSymbol ?? string.Empty).Trim().ToUpperInvariant();
    }

    private static List<MarketDepthLevelDto> ReadLevels(JsonElement root, string propertyName)
    {
        var levels = new List<MarketDepthLevelDto>();
        if (!root.TryGetProperty(propertyName, out var property))
        {
            return levels;
        }

        foreach (var row in property.EnumerateArray())
        {
            if (row.GetArrayLength() < 2)
            {
                continue;
            }

            levels.Add(new MarketDepthLevelDto
            {
                Price = ParseDecimal(row[0].GetString()),
                Quantity = ParseDecimal(row[1].GetString())
            });
        }

        return levels;
    }

    private static decimal ReadDecimal(JsonElement root, string propertyName)
    {
        return root.TryGetProperty(propertyName, out var property)
            ? ParseDecimal(property.GetString())
            : 0m;
    }

    private static decimal ParseDecimal(string? value)
    {
        return decimal.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : 0m;
    }
}
