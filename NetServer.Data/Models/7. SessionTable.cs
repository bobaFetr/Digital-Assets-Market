using System.ComponentModel.DataAnnotations;

namespace NetServer.Data.Models
{
    public class SessionTable
    {
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
