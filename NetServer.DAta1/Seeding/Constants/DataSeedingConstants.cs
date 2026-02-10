using Microsoft.EntityFrameworkCore.Diagnostics;
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
            //public const string User1Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
            public static readonly Guid User1Id =
    Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

            public const string Username1 = "Alice";
            public const string Email = "Alice@email.com";
            public const string Password = "Password";
            public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
            public const User.StatusBit Status1 = User.StatusBit.Active;
            public const bool IsBanned1 = false;
            //public  CreatedAt = 
        }

        
        //2
        public static class WalletConstants
        {
            //"a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            public static readonly Guid Wallet1Id = Guid.Parse("3249fc5e-7cd9-49ab-87db-c581a24f0938");
            public static readonly Guid User1Id = DataSeedingConstants.UserConstants.User1Id;
            public const string Currency1 = "BTC";
            public const decimal Balance1 = 1.5m;
            public const string Address1 = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
            public const string Status1 = "Active";
            public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
        }

        // //3
        public static class OrderConstants
        {
            public static readonly Guid Order1Id = Guid.Parse("23279bc0-3f81-4bbd-b44e-b61b92b01ba4");
            public static readonly Guid User1Id = DataSeedingConstants.UserConstants.User1Id;
            public const OrderType OrderType1 = OrderType.Buy;
            public const string Symbol1 = "BTCUSD";
            public const decimal Price1 = 50000.0m;
            public const decimal Amount1 = 0.1m;
            public const OrderStatus OrderStatus1 = OrderStatus.Open;
            public static readonly DateTime TimeStamp1 = new(2025, 8, 28);
        }

        //4
        public static class TradeConstants
        {
            public static readonly Guid Trade1Id = Guid.Parse("f3c9a1b2-4d5e-6789-abcd-0123456789ab");
            public static readonly Guid BuyOrderId1 = DataSeedingConstants.OrderConstants.Order1Id;
            //public static readonly OrderBook SellOrder = 
            //public const OrderBook Sellorder = null!;
            //public const OrderBook Buyorder = null!;
            public const decimal Price1 = 70000.0m;
            public const double Amount1 = 0.5;
            public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        }

        //5
                //5
        public static class OrderBookConstants
        {
            public static readonly Guid OrderBook1Id = Guid.Parse("9be10ead-9897-4083-aa15-6fbabd8ff701");
            public const string Symbol1 = "BTCUSD";
            public const decimal Price1 = 50000.0m;
            public const decimal Amount1 = 0.1m;
            public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        }


        //6
        public static class KycDocumentConstants
        {
            public static readonly Guid Doc1Id = DataSeedingConstants.UserConstants.User1Id;
            public const string Type1 = "Passport";
            public const string FilePath1 = "/path/to/document1.pdf";
            public const string DocumentNumber1 = "A12345678";
            public static readonly DateTime ExpiryDate1 = new(2030, 11, 28);
            public const string Status1 = "Pending";
            public static readonly DateTime UploadedAt1 = new(2025, 11, 28);
        }

        //7
        public static class SessionConstants
        {
            //DataSeedingConstants.UserConstants.User1Id;
            public static readonly Guid Session1Id = Guid.Parse("c0733dc5-908b-42fd-8623-8cba9e9b1b7b");
            public static readonly Guid User1Id = DataSeedingConstants.UserConstants.User1Id;
            public const string Token = "sample_token";
            public const string IpAddress1 = "89234.98324.2394.2948";
            public const string DeviceInfo1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
            public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
            public static readonly DateTime ExpiresAt1 = new(2025, 11, 29);
        }

        //8
        public static class AuditLogConstants
        {
            public static readonly Guid Log1Id = Guid.Parse("23116bf4-42b9-4d37-8569-f8a21e4b5265");
            public static readonly Guid User1Id = DataSeedingConstants.UserConstants.User1Id;
            public const string Action1 = "User Login";
            public const string Details1 = "User Alice logged in successfully.";
            public static readonly DateTime Timestamp1 = new(2025, 11, 28);
        }

        //9
        public static class BlockChainEventConstants
        {
            public static readonly Guid Event1Id = Guid.Parse("9651ad0b-80cc-4993-90d5-611317255952");
            public static readonly Guid ExchangeTransactionId = Guid.Parse(DataSeedingConstants.ExchangeTransactionConstants.Transaction1Id);
            public const string TxHash1 = "2d6ea11f-071b-45db-8cc1-e4a31e7ae808";
            public const string EventType1 = "Deposit";
            public const string Status1 = "Confirmed";
            public static readonly DateTime Timestamp1 = new(2025, 11, 28);
        }

        //10
        public static class ExchangeTransactionConstants
        {
            public const string Transaction1Id = "1a2b3c4d-5e6f-7890-abcd-ef1234567890";
            public static readonly Guid User1Id = DataSeedingConstants.UserConstants.User1Id;
            public const string TypeOfTransaction1 = "Deposit";
            public const string Currency1 = "BTC";
            public const decimal Amount1 = 0.5m;
            public const string Status1 = "Completed";
            public const string BlockchainTransactionHash1 = "0000000000000000000a7b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4";
            public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        }

        //11
        public static class FeeConstants 
        {
            public static readonly Guid Fee1Id = Guid.Parse("b1c2d3e4-f5a6-7890-abcd-ef1234567890");

            
            public const string Symbol1 = "BTCUSD";
            public const decimal MakerFee1 = 0.1m;
            public const decimal TakerFee1 = 0.2m;
            public static readonly DateTime UpdatedAt1 = new(2025, 11, 28);
        }

        //12
        public static class ReferralConstants
        {
            public static readonly Guid Referral1Id = Guid.Parse("1a2b3c4d-5e6f-7890-abcd-ef1234567890");
            public static readonly Guid ReferrerId = DataSeedingConstants.UserConstants.User1Id;
            public static readonly Guid ReferredId = Guid.Parse("2b3c4d5e-6f70-8910-abcd-ef1234567890");
            public const decimal BonusAmount1 = 50.0m;
            //public const DateTime Timestamp1 = new(2025, 11, 28);
            public static readonly DateTime Timestamp1 = new(2025, 12, 5);
        }



        


        //14
        // public static class NewsConstants
        // {
        //     public const string News1Id = "n1o2p3q4-r5s6-7890-abcd-ef1234567890";
        //     public const string Title1 = "Exchange Launches New Trading Pairs";
        //     public const string Content1 = "We are excited to announce the launch of new trading pairs on our exchange...";
        //     public const string Author1 = "Admin";
        //     public static readonly DateTime PublishedAt1 = new(2025, 11, 28);
        //     public const int CategoryId1 = 1;
        //     public const string CreatedBy1 = "Admin";
        //     public const string EditedBy1 = "Editor";
        //     public static readonly DateTime EditedOn1 = new(2025, 11, 29);
        //     public const string DeletedBy1 = "Moderator";
        //     public static readonly DateTime DeletedOn1 = new(2025, 12, 1);
        // }


        
        
    }
}