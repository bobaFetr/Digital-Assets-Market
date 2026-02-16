using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class AuditLog
    {
        [Key]
        public Guid LogId { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }
    }
}