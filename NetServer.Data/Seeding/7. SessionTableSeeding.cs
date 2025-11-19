using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class SessionTableSeeding
    {
        public static ICollection<SessionTable> GenerateTrades()
        {
            var sessionTables = new HashSet<SessionTable>();
            sessionTables.Add(new SessionTable
            {
                SessionId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Token = "sample",
                IpAddress = "123.0.0.1",
                DeviceInfo = "8 gb ram",
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            });
            return sessionTables;
        }
    }
}
