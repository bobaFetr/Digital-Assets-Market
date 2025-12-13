using System.ComponentModel.DataAnnotations;
namespace NetServer.Data.Models
{
    public class AuditLog
    {
        public AuditLog()
        {
            LogId = Guid.NewGuid();
            UserId = Guid.NewGuid();
            Action = string.Empty;
            Details = string.Empty;
            Timestamp = DateTime.UtcNow;
        }
        public AuditLog(Guid logId, Guid userId, DateTime timestamp)
        {
            LogId = logId;
            UserId = userId;
            Timestamp = timestamp;
        }
        [Key]
        public Guid LogId { get; set; }
        public Guid UserId { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }

        public User  User { get; set; }
    }
}
