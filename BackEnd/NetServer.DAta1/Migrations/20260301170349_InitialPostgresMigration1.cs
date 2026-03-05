using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgresMigration1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeeTables",
                columns: table => new
                {
                    FeeTableId = table.Column<Guid>(type: "uuid", nullable: false),
                    Symbol = table.Column<string>(type: "text", nullable: false),
                    FeeType = table.Column<string>(type: "text", nullable: false),
                    FeeAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeTables", x => x.FeeTableId);
                });

            migrationBuilder.CreateTable(
                name: "Referrals",
                columns: table => new
                {
                    ReferralId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferrerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferredId = table.Column<Guid>(type: "uuid", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referrals", x => x.ReferralId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    ProfilePictureUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsBanned = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    LogId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardDetails",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CardHolderName = table.Column<string>(type: "text", nullable: false),
                    CardLast4 = table.Column<string>(type: "text", nullable: false),
                    ExpiryDate = table.Column<string>(type: "text", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardDetails", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_CreditCardDetails_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FAQs",
                columns: table => new
                {
                    FaqId = table.Column<Guid>(type: "uuid", nullable: false),
                    Question = table.Column<string>(type: "text", nullable: false),
                    QuestionImageUrl = table.Column<string>(type: "text", nullable: true),
                    Answer = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uuid", nullable: false),
                    RepliedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FAQs", x => x.FaqId);
                    table.ForeignKey(
                        name: "FK_FAQs_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FAQs_Users_RepliedByUserId",
                        column: x => x.RepliedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "KycDocuments",
                columns: table => new
                {
                    DocId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    FilePath = table.Column<string>(type: "text", nullable: false),
                    DocumentNumber = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CountryOfResidence = table.Column<string>(type: "text", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KycDocuments", x => x.DocId);
                    table.ForeignKey(
                        name: "FK_KycDocuments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NewsTable",
                columns: table => new
                {
                    NewsId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Author = table.Column<Guid>(type: "uuid", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    EditedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    EditedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsTable", x => x.NewsId);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_Author",
                        column: x => x.Author,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_DeletedBy",
                        column: x => x.DeletedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_EditedBy",
                        column: x => x.EditedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FeeTableId = table.Column<Guid>(type: "uuid", nullable: true),
                    TypeOfOrder = table.Column<int>(type: "integer", nullable: false),
                    Symbol = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    OrderStatus = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_Orders_FeeTables_FeeTableId",
                        column: x => x.FeeTableId,
                        principalTable: "FeeTables",
                        principalColumn: "FeeTableId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    DeviceInfo = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.SessionId);
                    table.ForeignKey(
                        name: "FK_Sessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    TransactionID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserID = table.Column<Guid>(type: "uuid", nullable: false),
                    TypeOfTransaction = table.Column<string>(type: "text", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    BlockchainTransactionHash = table.Column<string>(type: "text", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.TransactionID);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Wallets",
                columns: table => new
                {
                    WalletID = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    Balance = table.Column<decimal>(type: "numeric", nullable: false),
                    Addres = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WalletTableWalletID = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallets", x => x.WalletID);
                    table.ForeignKey(
                        name: "FK_Wallets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Wallets_Wallets_WalletTableWalletID",
                        column: x => x.WalletTableWalletID,
                        principalTable: "Wallets",
                        principalColumn: "WalletID");
                });

            migrationBuilder.CreateTable(
                name: "OrderBookTable",
                columns: table => new
                {
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderBookId = table.Column<Guid>(type: "uuid", nullable: false),
                    Symbol = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderBookTable", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_OrderBookTable_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TradesTable",
                columns: table => new
                {
                    TradeId = table.Column<Guid>(type: "uuid", nullable: false),
                    BuyOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Price = table.Column<decimal>(type: "numeric", nullable: false),
                    Amount = table.Column<double>(type: "double precision", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TradesTable", x => x.TradeId);
                    table.ForeignKey(
                        name: "FK_TradesTable_Orders_BuyOrderId",
                        column: x => x.BuyOrderId,
                        principalTable: "Orders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TradesTable_Orders_SellOrderId",
                        column: x => x.SellOrderId,
                        principalTable: "Orders",
                        principalColumn: "OrderId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BlockchainEvents",
                columns: table => new
                {
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExchangeTransactionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TxHash = table.Column<string>(type: "text", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockchainEvents", x => x.EventId);
                    table.ForeignKey(
                        name: "FK_BlockchainEvents_Transactions_ExchangeTransactionId",
                        column: x => x.ExchangeTransactionId,
                        principalTable: "Transactions",
                        principalColumn: "TransactionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FeeTables",
                columns: new[] { "FeeTableId", "CreatedAt", "FeeAmount", "FeeType", "Symbol", "UpdatedAt" },
                values: new object[] { new Guid("b1c2d3e4-f5a6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), 0.1m, "Maker", "BTCUSD", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "Referrals",
                columns: new[] { "ReferralId", "BonusAmount", "ReferredId", "ReferrerId", "Timestamp" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), 50.0m, new Guid("2b3c4d5e-6f70-8910-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 5, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsBanned", "Password", "ProfilePictureUrl", "Role", "Status", "UserName" },
                values: new object[] { new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Alice@email.com", false, "Password", null, "User", 1, "Alice" });

            migrationBuilder.InsertData(
                table: "AuditLogs",
                columns: new[] { "LogId", "Action", "Details", "Timestamp", "UserId" },
                values: new object[] { new Guid("23116bf4-42b9-4d37-8569-f8a21e4b5265"), "User Login", "User Alice logged in successfully.", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.InsertData(
                table: "FAQs",
                columns: new[] { "FaqId", "Answer", "AuthorId", "CategoryId", "CreatedAt", "PublishedAt", "Question", "QuestionImageUrl", "RepliedByUserId", "UpdatedAt" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), "To create an account, click on the Sign Up button and fill in the required information.", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("12345678-90ab-cdef-1234-567890abcdef"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 11, 30, 0, 0, 0, 0, DateTimeKind.Utc), "How to create an account?", null, null, new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "KycDocuments",
                columns: new[] { "DocId", "CountryOfResidence", "DateOfBirth", "DocumentNumber", "ExpiryDate", "FilePath", "FullName", "Status", "Type", "UploadedAt", "UserId" },
                values: new object[] { new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "BG", new DateTime(1994, 5, 20, 0, 0, 0, 0, DateTimeKind.Utc), "A12345678", new DateTime(2030, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "/path/to/document1.pdf", "Alice Example", "Pending", "Passport", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.InsertData(
                table: "NewsTable",
                columns: new[] { "NewsId", "Author", "Content", "CreatedAt", "CreatedBy", "DeletedBy", "DeletedOn", "EditedBy", "EditedOn", "PublishedAt", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "We are excited to announce the release of margin trading on our platform. Users can now trade with leverage up to 5x on selected pairs.", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 30, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "New Feature Release: Margin Trading", new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("2b3c4d5e-6f70-8910-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "Our trading API now delivers order book snapshots with lower latency and improved depth support for BTCUSD, ETHUSD, and BNBUSD.", new DateTime(2025, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 4, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 2, 0, 0, 0, 0, DateTimeKind.Utc), "API Upgrade: Faster Order Book", new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("3c4d5e6f-7081-9210-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "We added device-aware withdrawal checks and optional 2FA prompts for high-risk activity to better protect your account.", new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 10, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 9, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Security Notice: New Withdrawal Safeguards", new DateTime(2025, 12, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("4d5e6f70-8192-a210-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "ALGO-EUR spot trading is now live. Review the listing details and start trading with tighter spreads.", new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Utc), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 16, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Utc), "New Listing: ALGO-EUR Spot", new DateTime(2025, 12, 16, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "OrderId", "Amount", "CreatedAt", "FeeTableId", "OrderStatus", "Price", "Symbol", "TypeOfOrder", "UserId" },
                values: new object[] { new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 0.1m, new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Utc), null, 0, 50000.0m, "BTCUSD", 0, new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.InsertData(
                table: "Sessions",
                columns: new[] { "SessionId", "CreatedAt", "DeviceInfo", "ExpiresAt", "IpAddress", "Token", "UserId" },
                values: new object[] { new Guid("c0733dc5-908b-42fd-8623-8cba9e9b1b7b"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3", new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Utc), "89234.98324.2394.2948", "sample_token", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "TransactionID", "Amount", "BlockchainTransactionHash", "Currency", "Status", "TimeStamp", "TypeOfTransaction", "UserID" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), 0.5m, "0000000000000000000a7b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", "BTC", "Completed", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "Deposit", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.InsertData(
                table: "Wallets",
                columns: new[] { "WalletID", "Addres", "Balance", "CreatedAt", "Currency", "Status", "UserId", "WalletTableWalletID" },
                values: new object[] { new Guid("3249fc5e-7cd9-49ab-87db-c581a24f0938"), "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", 1.5m, new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "BTC", "Active", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), null });

            migrationBuilder.InsertData(
                table: "BlockchainEvents",
                columns: new[] { "EventId", "EventType", "ExchangeTransactionId", "Status", "Timestamp", "TxHash" },
                values: new object[] { new Guid("9651ad0b-80cc-4993-90d5-611317255952"), "Deposit", new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), "Confirmed", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc), "2d6ea11f-071b-45db-8cc1-e4a31e7ae808" });

            migrationBuilder.InsertData(
                table: "OrderBookTable",
                columns: new[] { "OrderId", "Amount", "OrderBookId", "Price", "Symbol", "Timestamp" },
                values: new object[] { new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 0.1m, new Guid("155e07f5-04a6-4257-a5ac-bcc619aa3375"), 50000.0m, "BTCUSD", new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "TradesTable",
                columns: new[] { "TradeId", "Amount", "BuyOrderId", "Price", "SellOrderId", "TimeStamp" },
                values: new object[] { new Guid("f3c9a1b2-4d5e-6789-abcd-0123456789ab"), 0.5, new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 70000.0m, null, new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BlockchainEvents_ExchangeTransactionId",
                table: "BlockchainEvents",
                column: "ExchangeTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_FAQs_AuthorId",
                table: "FAQs",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_FAQs_RepliedByUserId",
                table: "FAQs",
                column: "RepliedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_KycDocuments_UserId",
                table: "KycDocuments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_Author",
                table: "NewsTable",
                column: "Author");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_CreatedBy",
                table: "NewsTable",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_DeletedBy",
                table: "NewsTable",
                column: "DeletedBy");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_EditedBy",
                table: "NewsTable",
                column: "EditedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_FeeTableId",
                table: "Orders",
                column: "FeeTableId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_UserId",
                table: "Sessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TradesTable_BuyOrderId",
                table: "TradesTable",
                column: "BuyOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_TradesTable_SellOrderId",
                table: "TradesTable",
                column: "SellOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserID",
                table: "Transactions",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId",
                table: "Wallets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_WalletTableWalletID",
                table: "Wallets",
                column: "WalletTableWalletID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "BlockchainEvents");

            migrationBuilder.DropTable(
                name: "CreditCardDetails");

            migrationBuilder.DropTable(
                name: "FAQs");

            migrationBuilder.DropTable(
                name: "KycDocuments");

            migrationBuilder.DropTable(
                name: "NewsTable");

            migrationBuilder.DropTable(
                name: "OrderBookTable");

            migrationBuilder.DropTable(
                name: "Referrals");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "TradesTable");

            migrationBuilder.DropTable(
                name: "Wallets");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "FeeTables");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
