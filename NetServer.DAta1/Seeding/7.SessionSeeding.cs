using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
namespace NetServer.Data.Seeding
{
    public class Session1Seeding
    {
        public static IEnumerable<SessionTable> GenerateSessions()
        {
            var sessions = new HashSet<SessionTable>();
            sessions.Add(new SessionTable
            {
                SessionId = DataSeedingConstants.SessionConstants.Session1Id,
                UserId = DataSeedingConstants.UserConstants.User1Id,
                Token = DataSeedingConstants.SessionConstants.Token,
                IpAddress = DataSeedingConstants.SessionConstants.IpAddress1,
                DeviceInfo = DataSeedingConstants.SessionConstants.DeviceInfo1,
                CreatedAt = DataSeedingConstants.SessionConstants.CreatedAt1,
                ExpiresAt = DataSeedingConstants.SessionConstants.ExpiresAt1
            });

            return sessions;
        }
    }
}