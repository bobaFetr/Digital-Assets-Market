using Microsoft.Identity.Client;
using NetServer.Data.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace NetServer.Data.Seeding.Constants
{
    public static class DataSeedingConstants
    {
        //1
        public static class UserConstants
        {
            public const string User1Id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
            public const string Username1 = "Alice";
            public const string Email = "Alice@email.com";
            public const string Password = "Password";
            public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
            public const User.StatusBit Status1 = User.StatusBit.Active;
            public const bool IsBanned1 = false;
        }

        //2
        public static class WalletConstants
        {
            public const string Wallet1Id = "b1c2d3e4-f5g6-7890-abcd-ef1234567890";

        }

        //3
        public static class OrderConstants
        {

        }

        //4
        public static class TradeConstants
        {

        }

        //5
        public static class OrderBookConstants
        {

        }


        //6
        public static class KycDocumentConstants
        {
        }

        //7
        public static class SessionConstants
        {
        }

        //8
        public static class AuditLogConstants
        {
        }

        //9
        public static class BlockChainEventtConstants
        {
        }

        //10
        public static class ExchangeTransactionConstants
        {
        }

        //11
        public static class FeeConstants 
        {
        }

        //12
        public static class referralConstants
        {
        }

        //13
        public static class ChatConstants 
        {
        }

        //14
        public static class FAQConstants
        {
        }
    }
}
