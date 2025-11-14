using System.ComponentModel.DataAnnotations;
using UserNameSpace.Data;

namespace SessionTableNameSpace
{
    public class SessionTable
    {
        [Key]
        public int SessionId { get; set; }
        public int UserId { get; set; }
        public string Token { get; set; }
        public string IpAddress { get; set; }
        public string DeviceInfo { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }

        public User User { get; set; }
    }

}