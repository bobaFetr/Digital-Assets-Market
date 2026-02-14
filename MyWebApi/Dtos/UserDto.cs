namespace MyWebApi.Dtos
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public object Status { get; set; } = default!;
        public bool IsBanned { get; set; }
        public decimal WalletBalance { get; set; }
    }
}