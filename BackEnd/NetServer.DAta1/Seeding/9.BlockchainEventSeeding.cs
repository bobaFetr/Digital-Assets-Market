using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NetServer.Data.Models;
using NetServer.Data.Seeding.Constants;
namespace NetServer.Data.Seeding
{
    public static class BlockchainEventSeeding
    {
        public static IEnumerable<BlockchainEvent> GenerateBlockchainEvents()
        {
            var blockchainEvents = new HashSet<BlockchainEvent>();
            blockchainEvents.Add(new BlockchainEvent
            {
                EventId = DataSeedingConstants.BlockChainEventConstants.Event1Id,
                ExchangeTransactionId = DataSeedingConstants.BlockChainEventConstants.ExchangeTransactionId,
                TxHash = DataSeedingConstants.BlockChainEventConstants.TxHash1,
                EventType = DataSeedingConstants.BlockChainEventConstants.EventType1,
                Status = DataSeedingConstants.BlockChainEventConstants.Status1,
                Timestamp = DataSeedingConstants.BlockChainEventConstants.Timestamp1
            });
            return blockchainEvents;
        }
    }
}