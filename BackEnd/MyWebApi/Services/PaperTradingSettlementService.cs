namespace MyWebApi.Services;

public sealed class PaperTradingSettlementService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PaperTradingSettlementService> _logger;

    public PaperTradingSettlementService(IServiceScopeFactory scopeFactory, ILogger<PaperTradingSettlementService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var paperTradingService = scope.ServiceProvider.GetRequiredService<PaperTradingService>();
                await paperTradingService.ProcessOpenOrdersAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error while processing open paper trading orders.");
            }
        }
    }
}
