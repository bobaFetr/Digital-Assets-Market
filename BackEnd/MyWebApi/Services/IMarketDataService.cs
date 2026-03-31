namespace MyWebApi.Services;

public interface IMarketDataService
{
    bool TryMapSymbol(string appSymbol, out string marketSymbol);
    IReadOnlyCollection<string> GetSupportedSymbols();
    Task<MarketTickerDto?> GetTickerAsync(string appSymbol, CancellationToken cancellationToken = default);
    Task<MarketDepthDto?> GetDepthAsync(string appSymbol, int limit = 20, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MarketCandleDto>> GetKlinesAsync(string appSymbol, string interval = "1m", int limit = 120, CancellationToken cancellationToken = default);
}
