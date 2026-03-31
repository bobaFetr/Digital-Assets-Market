public class MarketTickerDto
{
    public string Symbol { get; set; } = string.Empty;
    public string MarketSymbol { get; set; } = string.Empty;
    public decimal LastPrice { get; set; }
    public decimal BidPrice { get; set; }
    public decimal AskPrice { get; set; }
    public decimal PriceChangePercent { get; set; }
    public DateTime AsOfUtc { get; set; }
    public string Source { get; set; } = "Binance";
}

public class MarketDepthLevelDto
{
    public decimal Price { get; set; }
    public decimal Quantity { get; set; }
}

public class MarketDepthDto
{
    public string Symbol { get; set; } = string.Empty;
    public string MarketSymbol { get; set; } = string.Empty;
    public DateTime AsOfUtc { get; set; }
    public List<MarketDepthLevelDto> Bids { get; set; } = new();
    public List<MarketDepthLevelDto> Asks { get; set; } = new();
    public string Source { get; set; } = "Binance";
}

public class MarketCandleDto
{
    public string Symbol { get; set; } = string.Empty;
    public string MarketSymbol { get; set; } = string.Empty;
    public DateTime OpenTimeUtc { get; set; }
    public DateTime CloseTimeUtc { get; set; }
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Volume { get; set; }
    public string Source { get; set; } = "Binance";
}
