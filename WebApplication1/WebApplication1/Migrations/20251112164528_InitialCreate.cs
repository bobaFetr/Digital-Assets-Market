using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BlockchainEventtable",
                columns: table => new
                {
                    EventId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TxHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockchainEventtable", x => x.EventId);
                });

            migrationBuilder.CreateTable(
                name: "FeesTable",
                columns: table => new
                {
                    FeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MakerFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TakerFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeesTable", x => x.FeeId);
                });

            migrationBuilder.CreateTable(
                name: "OrderBookTable",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Symbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Side = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderBookTable", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogTable",
                columns: table => new
                {
                    LogId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId1 = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogTable", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_AuditLogTable_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KycDocumenTable",
                columns: table => new
                {
                    DocId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId1 = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KycDocumenTable", x => x.DocId);
                    table.ForeignKey(
                        name: "FK_KycDocumenTable_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrdersTable",
                columns: table => new
                {
                    Order_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    User_Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type_Of_Order = table.Column<int>(type: "int", nullable: false),
                    symbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Order_Status = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdersTable", x => x.Order_Id);
                    table.ForeignKey(
                        name: "FK_OrdersTable_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReferralsTable",
                columns: table => new
                {
                    ReferralId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReferrerId = table.Column<int>(type: "int", nullable: false),
                    ReferredId = table.Column<int>(type: "int", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralsTable", x => x.ReferralId);
                    table.ForeignKey(
                        name: "FK_ReferralsTable_Users_ReferredId",
                        column: x => x.ReferredId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReferralsTable_Users_ReferrerId",
                        column: x => x.ReferrerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SessionTable",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId1 = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionTable", x => x.SessionId);
                    table.ForeignKey(
                        name: "FK_SessionTable_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TransactionsTable",
                columns: table => new
                {
                    TransactionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    TypeOfTransaction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlockchainTransactionHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BlockchainEventEventId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionsTable", x => x.TransactionID);
                    table.ForeignKey(
                        name: "FK_TransactionsTable_BlockchainEventtable_BlockchainEventEventId",
                        column: x => x.BlockchainEventEventId,
                        principalTable: "BlockchainEventtable",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TransactionsTable_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Wallets",
                columns: table => new
                {
                    WalletID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Addres = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                });

            migrationBuilder.CreateTable(
                name: "TradesTable",
                columns: table => new
                {
                    Trade_ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Buy_Order_Id = table.Column<int>(type: "int", nullable: false),
                    Sell_Order_Id = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<double>(type: "float", nullable: false),
                    timestamp = table.Column<double>(type: "float", nullable: false),
                    OrderBookId = table.Column<int>(type: "int", nullable: true),
                    OrderBookId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TradesTable", x => x.Trade_ID);
                    table.ForeignKey(
                        name: "FK_TradesTable_OrderBookTable_OrderBookId",
                        column: x => x.OrderBookId,
                        principalTable: "OrderBookTable",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TradesTable_OrderBookTable_OrderBookId1",
                        column: x => x.OrderBookId1,
                        principalTable: "OrderBookTable",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TradesTable_OrdersTable_Buy_Order_Id",
                        column: x => x.Buy_Order_Id,
                        principalTable: "OrdersTable",
                        principalColumn: "Order_Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TradesTable_OrdersTable_Sell_Order_Id",
                        column: x => x.Sell_Order_Id,
                        principalTable: "OrdersTable",
                        principalColumn: "Order_Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogTable_UserId1",
                table: "AuditLogTable",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_KycDocumenTable_UserId1",
                table: "KycDocumenTable",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_OrdersTable_UserId",
                table: "OrdersTable",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralsTable_ReferredId",
                table: "ReferralsTable",
                column: "ReferredId");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralsTable_ReferrerId",
                table: "ReferralsTable",
                column: "ReferrerId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionTable_UserId1",
                table: "SessionTable",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_TradesTable_Buy_Order_Id",
                table: "TradesTable",
                column: "Buy_Order_Id");

            migrationBuilder.CreateIndex(
                name: "IX_TradesTable_OrderBookId",
                table: "TradesTable",
                column: "OrderBookId");

            migrationBuilder.CreateIndex(
                name: "IX_TradesTable_OrderBookId1",
                table: "TradesTable",
                column: "OrderBookId1");

            migrationBuilder.CreateIndex(
                name: "IX_TradesTable_Sell_Order_Id",
                table: "TradesTable",
                column: "Sell_Order_Id");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsTable_BlockchainEventEventId",
                table: "TransactionsTable",
                column: "BlockchainEventEventId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionsTable_UserID",
                table: "TransactionsTable",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId",
                table: "Wallets",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogTable");

            migrationBuilder.DropTable(
                name: "FeesTable");

            migrationBuilder.DropTable(
                name: "KycDocumenTable");

            migrationBuilder.DropTable(
                name: "ReferralsTable");

            migrationBuilder.DropTable(
                name: "SessionTable");

            migrationBuilder.DropTable(
                name: "TradesTable");

            migrationBuilder.DropTable(
                name: "TransactionsTable");

            migrationBuilder.DropTable(
                name: "Wallets");

            migrationBuilder.DropTable(
                name: "OrderBookTable");

            migrationBuilder.DropTable(
                name: "OrdersTable");

            migrationBuilder.DropTable(
                name: "BlockchainEventtable");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
