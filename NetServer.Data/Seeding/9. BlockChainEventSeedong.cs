using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding
{
    public static class BlockChainEventSeeding
    {
        public static ICollection<BlockchainEvent> GenerateTrades()
        {
            var blockChainEvents = new HashSet<BlockchainEvent>();
            blockChainEvents.Add(new BlockchainEvent
            {
                EventId = Guid.NewGuid(),
                TxHash = "0xabc123",
                EventType = "Transfer",
                Status = "Confirmed",
                Timestamp = DateTime.UtcNow.AddDays(10)
            });
            return blockChainEvents;
        }
    }
}
