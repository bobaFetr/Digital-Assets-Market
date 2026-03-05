using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
namespace NetServer.Data.Seeding
{
    public class AuditLogSeeding
    {
        public static IEnumerable<AuditLog> GenerateAuditLogs()
        {
            var auditLogs = new HashSet<AuditLog>();
            auditLogs.Add(new AuditLog
            {
                LogId = DataSeedingConstants.AuditLogConstants.Log1Id,
                UserId = DataSeedingConstants.AuditLogConstants.User1Id,
                Action = DataSeedingConstants.AuditLogConstants.Action1,
                Details = DataSeedingConstants.AuditLogConstants.Details1,
                Timestamp = DataSeedingConstants.AuditLogConstants.Timestamp1
            });
            return auditLogs;
        }
    }
}