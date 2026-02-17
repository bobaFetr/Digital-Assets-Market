using NetServer.Data.Models;

public class UserDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public User.StatusBit Status { get; set; }
    public bool IsBanned { get; set; }
}

public class WalletDto
{
    public Guid WalletId { get; set; }
    public Guid UserId { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateWalletRequest
{
    public Guid? UserId { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
}

public class UpdateWalletRequest
{
    public string? Currency { get; set; }
    public decimal? Balance { get; set; }
    public string? Address { get; set; }
    public string? Status { get; set; }
}

public class OrderDto
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public Guid? FeeTableId { get; set; }
    public OrderType TypeOfOrder { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Amount { get; set; }
    public OrderStatus OrderStatus { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateOrderRequest
{
    public Guid? UserId { get; set; }
    public Guid? FeeTableId { get; set; }
    public OrderType TypeOfOrder { get; set; }
    public string OrderKind { get; set; } = "Market";
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Amount { get; set; }
    public OrderStatus? OrderStatus { get; set; }
}

public class UpdateOrderRequest
{
    public Guid? FeeTableId { get; set; }
    public decimal? Price { get; set; }
    public decimal? Amount { get; set; }
    public OrderStatus? OrderStatus { get; set; }
}

public class TradeDto
{
    public Guid TradeId { get; set; }
    public Guid BuyOrderId { get; set; }
    public Guid? SellOrderId { get; set; }
    public decimal Price { get; set; }
    public double Amount { get; set; }
    public DateTime TimeStamp { get; set; }
    public string Symbol { get; set; } = string.Empty;
}

public class CreateTradeRequest
{
    public Guid BuyOrderId { get; set; }
    public Guid? SellOrderId { get; set; }
    public decimal Price { get; set; }
    public double Amount { get; set; }
    public DateTime? TimeStamp { get; set; }
}

public class OrderBookDto
{
    public Guid OrderId { get; set; }
    public Guid OrderBookId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Amount { get; set; }
    public DateTime Timestamp { get; set; }
}

public class CreateOrderBookRequest
{
    public Guid OrderId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Amount { get; set; }
    public DateTime? Timestamp { get; set; }
}

public class UpdateOrderBookRequest
{
    public string? Symbol { get; set; }
    public decimal? Price { get; set; }
    public decimal? Amount { get; set; }
}

public class KycDocumentDto
{
    public Guid DocId { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string CountryOfResidence { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
}

public class CreateKycDocumentRequest
{
    public Guid? UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string DocumentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string CountryOfResidence { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class UpdateKycDocumentRequest
{
    public string? Type { get; set; }
    public string? FilePath { get; set; }
    public string? DocumentNumber { get; set; }
    public string? FullName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? CountryOfResidence { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Status { get; set; }
}

public class SessionDto
{
    public Guid SessionId { get; set; }
    public Guid UserId { get; set; }
    public string IpAddress { get; set; } = string.Empty;
    public string DeviceInfo { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class CreateSessionRequest
{
    public Guid? UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string DeviceInfo { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UpdateSessionRequest
{
    public string? IpAddress { get; set; }
    public string? DeviceInfo { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class AuditLogDto
{
    public Guid LogId { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class CreateAuditLogRequest
{
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime? Timestamp { get; set; }
}

public class UpdateAuditLogRequest
{
    public string? Action { get; set; }
    public string? Details { get; set; }
}

public class BlockchainEventDto
{
    public Guid EventId { get; set; }
    public Guid ExchangeTransactionId { get; set; }
    public string TxHash { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class CreateBlockchainEventRequest
{
    public Guid ExchangeTransactionId { get; set; }
    public string TxHash { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? Timestamp { get; set; }
}

public class UpdateBlockchainEventRequest
{
    public string? TxHash { get; set; }
    public string? EventType { get; set; }
    public string? Status { get; set; }
}

public class ExchangeTransactionDto
{
    public Guid TransactionId { get; set; }
    public Guid UserId { get; set; }
    public string TypeOfTransaction { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string BlockchainTransactionHash { get; set; } = string.Empty;
    public DateTime TimeStamp { get; set; }
}

public class CreateExchangeTransactionRequest
{
    public Guid? UserId { get; set; }
    public string TypeOfTransaction { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string BlockchainTransactionHash { get; set; } = string.Empty;
    public DateTime? TimeStamp { get; set; }
}

public class UpdateExchangeTransactionRequest
{
    public decimal? Amount { get; set; }
    public string? Status { get; set; }
    public string? BlockchainTransactionHash { get; set; }
}

public class FeeTableDto
{
    public Guid FeeTableId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public string FeeType { get; set; } = string.Empty;
    public decimal FeeAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateFeeTableRequest
{
    public string Symbol { get; set; } = string.Empty;
    public string FeeType { get; set; } = string.Empty;
    public decimal FeeAmount { get; set; }
}

public class UpdateFeeTableRequest
{
    public string? Symbol { get; set; }
    public string? FeeType { get; set; }
    public decimal? FeeAmount { get; set; }
}

public class ReferralDto
{
    public Guid ReferralId { get; set; }
    public Guid ReferrerId { get; set; }
    public Guid ReferredId { get; set; }
    public decimal BonusAmount { get; set; }
    public DateTime Timestamp { get; set; }
}

public class CreateReferralRequest
{
    public Guid ReferrerId { get; set; }
    public Guid ReferredId { get; set; }
    public decimal BonusAmount { get; set; }
    public DateTime? Timestamp { get; set; }
}

public class UpdateReferralRequest
{
    public decimal? BonusAmount { get; set; }
}

public class NewsDto
{
    public Guid NewsId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid Author { get; set; }
    public DateTime PublishedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateNewsRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }
}
