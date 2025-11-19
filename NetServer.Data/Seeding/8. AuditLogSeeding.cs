using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class AuditLogSeeding
    {
        public static ICollection<AuditLog> GenerateTrades()
        {
            var auditLogs = new HashSet<AuditLog>();
            auditLogs.Add(new AuditLog
            {
                LogId = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Action = "UserLogin",
                Details = "User logged in successfully.",
                Timestamp = DateTime.UtcNow
            });
            return auditLogs;
        }
    }
}
