using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class SessionTable
    {

        public SessionTable()
        {
            SessionId = Guid.NewGuid();
            UserId = Guid.NewGuid();
            Token = string.Empty;
            IpAddress = string.Empty;
            DeviceInfo = string.Empty;
            CreatedAt = DateTime.UtcNow;
            ExpiresAt = DateTime.UtcNow.AddHours(1);
        }
        public SessionTable(Guid sessionId, Guid userId, DateTime createdAt, DateTime expiresAt)
        { 
            SessionId= sessionId;
            UserId= userId;
            CreatedAt= createdAt;
            ExpiresAt= expiresAt;
        }
        [Key]
        public Guid SessionId { get; set; }
        public Guid UserId { get; set; }
        public string Token { get; set; }
        public string IpAddress { get; set; }
        public string DeviceInfo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }

        public User User { get; set; }
    }

}
