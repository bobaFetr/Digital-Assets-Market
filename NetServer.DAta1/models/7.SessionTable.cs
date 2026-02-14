using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NetServer.Data.Models
{
    public class SessionTable
    {
        [Key]
        public Guid SessionId { get; set; }
        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Token { get; set; }
        public string IpAddress { get; set; }
        public string DeviceInfo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}