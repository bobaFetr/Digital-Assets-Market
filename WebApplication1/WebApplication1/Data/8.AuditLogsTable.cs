using System.ComponentModel.DataAnnotations;
using UserNameSpace.Data;

namespace AuditLogTableNameSpace
{
    public class AuditLog
    {
        [Key]
        public Guid LogId { get; set; }
        public Guid UserId { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }

        public User  User { get; set; }
    }
}