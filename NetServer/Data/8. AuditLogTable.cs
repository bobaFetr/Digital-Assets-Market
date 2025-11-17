namespace DAM
{
    public class AuditLog
    {
        [Key]
        public int LogId { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }

        public User  User { get; set; }
    }
}
