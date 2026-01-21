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
        // public static class WalletConstants
        // {
        //     public const string Wallet1Id = "b1c2d3e4-f5g6-7890-abcd-ef1234567890";
        //     public const string User1Id = DataSeedingConstants.UserConstants.User1Id;
        //     public const string Currency1 = "BTC";
        //     public const decimal Balance1 = 1.5m;
        //     public const string Address1 = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
        //     public const string Status1 = "Active";
        //     public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
        // }

        // //3
        // public static class OrderConstants
        // {
        //     public const string Order1Id = "c1d2e3f4-g5h6-7890-abcd-ef1234567890";
        //     public const string User1Id = DataSeedingConstants.UserConstants.User1Id;
        //     public const string OrderType1 = "Buy";
        //     public const string Symbol1 = "BTCUSD";
        //     public const decimal Price1 = 50000.0m;
        //     public const decimal Amount1 = 0.1m;
        //     public const string OrderStatus1 = "Open";
        //     public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        // }

        //4
        // public static class TradeConstants
        // {
        //     public const string Trade1Id = "d1e2f3g4-h5i6-7890-abcd-ef1234567890";
        //     public const string BuyOrderId1 = DataSeedingConstants.OrderConstants.Order1Id;
        //     public const string SellOrderId1 = "e1f2g3h4-i5j6-7890-abcd-ef1234567890";
        //     public const OrderBook Sellorder = null!;
        //     public const OrderBook Buyorder = null!;
        //     public const decimal Price1 = 50000.0m;
        //     public const double Amount1 = 0.1;
        //     public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        // }

        //5
        // public static class OrderBookConstants
        // {
        //     public const string OrderBook1Id = "e1f2g3h4-i5j6-7890-abcd-ef1234567890";
        //     public const string Symbol1 = "BTCUSD";
        //     public const decimal Price1 = 50000.0m;
        //     public const decimal Amount1 = 0.1m;
        //     public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        // }


        //6
        // public static class KycDocumentConstants
        // {
        //     public  const string Doc1Id = "f1g2h3i4-j5k6-7890-abcd-ef1234567890";
        //     public const string User1Id = DataSeedingConstants.UserConstants.User1Id;
        //     public const string Type1 = "Passport";
        //     public const string FilePath1 = "/path/to/document1.pdf";
        //     public const string DocumentNumber1 = "A12345678";
        //     public static readonly DateTime ExpiryDate1 = new(2030, 11, 28);
        //     public const string Status1 = "Pending";
        //     public static readonly DateTime SubmittedAt1 = new(2025, 11, 28);
        //     public static readonly DateTime SubmittedAt2 = new(2025, 12, 5);
        // }

        //7
        // public static class SessionConstants
        // {
        //     public const string Session1Id = "g1h2i3j4-k5l6-7890-abcd-ef1234567890";
        //     public const string User1Id = DataSeedingConstants.UserConstants.User1Id;
        //     public const string Token = "sample_token";
        //     public const string IpAddress1 = "";
        //     public const string DeviceInfo1 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
        //     public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
        //     public static readonly DateTime ExpiresAt1 = new(2025, 11, 29);
        // }

        //8
        // public static class AuditLogConstants
        // {
        //     public const string Log1Id = "h1i2j3k4-l5m6-7890-abcd-ef1234567890";
        //     public const string User1Id = DataSeedingConstants.UserConstants.User1Id;
        //     public const string Action1 = "User Login";
        //     public const string Details1 = "User Alice logged in successfully.";
        //     public static readonly DateTime Timestamp1 = new(2025, 11, 28);
        // }

        //9
        // public static class BlockChainEventtConstants
        // {
        //     public const string Event1Id = "i1j2k3l4-m5n6-7890-abcd-ef1234567890";
        //     public const string TxHash1 = "0000000000000000000a7b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4";
        //     public const string EventType1 = "Deposit";
        //     public const string Status1 = "Confirmed";
        //     public static readonly DateTime Timestamp1 = new(2025, 11, 28);
        // }

        //10
        // public static class ExchangeTransactionConstants
        // {
        //     public const string Transaction1Id = "j1k2l3m4-n5o6-7890-abcd-ef1234567890";
        //     public const string User1Id = DataSeedingConstants.UserConstants.User1Id;
        //     public const string TypeOfTransaction1 = "Deposit";
        //     public const string Currency1 = "BTC";
        //     public const decimal Amount1 = 0.5m;
        //     public const string Status1 = "Completed";
        //     public const string BlockchainTransactionHash1 = "0000000000000000000a7b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4";
        //     public static readonly DateTime TimeStamp1 = new(2025, 11, 28);
        // }

        //11
        // public static class FeeConstants 
        // {
        //     public const string Fee1Id = "k1l2m3n4-o5p6-7890-abcd-ef1234567890";
        //     public const string Symbol1 = "BTCUSD";
        //     public const decimal MakerFee1 = 0.1m;
        //     public const decimal TakerFee1 = 0.2m;
        //     public static readonly DateTime UpdatedAt1 = new(2025, 11, 28);
        // }

        //12
        // public static class referralConstants
        // {
        //     public static string Referral1Id = "l1m2n3o4-p5q6-7890-abcd-ef1234567890";
        //     public static string ReferrerId = DataSeedingConstants.UserConstants.User1Id;
        //     public static string ReferredId = "m1n2o3p4-q5r6-7890-abcd-ef1234567890";
        //     public const decimal BonusAmount1 = 50.0m;
        //     //public const DateTime Timestamp1 = new(2025, 11, 28);
        //     public static readonly DateTime Timestamp1 = new(2025, 12, 5);
        // }

        //13
        // public static class ChatConstants 
        // {
        //     public const string Chat1Id = "m1n2o3p4-q5r6-7890-abcd-ef1234567890";
        //     public const string SenderId1 = DataSeedingConstants.UserConstants.User1Id;
        //     public const string ReceiverId1 = "n1o2p3q4-r5s6-7890-abcd-ef1234567890";
        //     public const string Message1 = "Hello, how can I help you?";
        //     public static readonly DateTime Timestamp1 = new(2025, 11, 28);
        //     public static readonly DateTime MessageSendDate = new(2025, 11, 29);
        //     public static readonly DateTime MessageEdit = new(2025, 11, 29);
        //     public static readonly DateTime MessageDeleted = new(2025, 11, 29);
        // }
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
        //15
        // public static class FAQConstants
        // {
        //     public const string FAQ1Id = "o1p2q3r4-s5t6-7890-abcd-ef1234567890";
        //     public const string Question1 = "How to create an account?";
        //     public const string Answer1 = "To create an account, click on the Sign Up button and fill in the required details...";
        //     public static readonly DateTime CreatedAt1 = new(2025, 11, 28);
        //     public static readonly DateTime UpdatedAt1 = new(2025, 11, 29);
        // }
    }
}