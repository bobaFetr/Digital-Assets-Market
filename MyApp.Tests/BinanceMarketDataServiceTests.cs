using Microsoft.Extensions.Logging.Abstractions;
using MyWebApi.Services;

namespace MyApp.Tests;

public class BinanceMarketDataServiceTests
{
    private sealed class OfflineHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            throw new HttpRequestException("Market provider unavailable");
        }
    }

    private static BinanceMarketDataService CreateService()
    {
        return new BinanceMarketDataService(
            new HttpClient(new OfflineHandler()) { BaseAddress = new Uri("https://market.test") },
            NullLogger<BinanceMarketDataService>.Instance);
    }

    [Test]
    public async Task GetTickerAsync_ReturnsSimulatedTicker_WhenProviderIsOffline()
    {
        var ticker = await CreateService().GetTickerAsync("BTCUSD");

        Assert.That(ticker, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(ticker!.Source, Is.EqualTo("Simulated"));
            Assert.That(ticker.LastPrice, Is.GreaterThan(0));
        });
    }

    [Test]
    public async Task GetDepthAsync_ReturnsRequestedSimulatedLiquidity_WhenProviderIsOffline()
    {
        var depth = await CreateService().GetDepthAsync("BTCUSD", 12);

        Assert.That(depth, Is.Not.Null);
        Assert.Multiple(() =>
        {
            Assert.That(depth!.Source, Is.EqualTo("Simulated"));
            Assert.That(depth.Bids, Has.Count.EqualTo(12));
            Assert.That(depth.Asks, Has.Count.EqualTo(12));
        });
    }

    [Test]
    public async Task GetKlinesAsync_ReturnsRequestedSimulatedHistory_WhenProviderIsOffline()
    {
        var candles = await CreateService().GetKlinesAsync("BNBUSD", "1m", 60);

        Assert.Multiple(() =>
        {
            Assert.That(candles, Has.Count.EqualTo(60));
            Assert.That(candles.All(candle => candle.Source == "Simulated"), Is.True);
            Assert.That(candles.All(candle => candle.Close > 0), Is.True);
        });
    }
}
