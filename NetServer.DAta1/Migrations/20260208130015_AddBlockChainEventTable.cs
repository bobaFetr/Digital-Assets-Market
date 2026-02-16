using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddBlockChainEventTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExchangeTransaction",
                columns: table => new
                {
                    TransactionID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TypeOfTransaction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlockchainTransactionHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeTransaction", x => x.TransactionID);
                });

            migrationBuilder.CreateTable(
                name: "BlockchainEvent",
                columns: table => new
                {
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExchangeTransactionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TxHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockchainEvent", x => x.EventId);
                    table.ForeignKey(
                        name: "FK_BlockchainEvent_ExchangeTransaction_ExchangeTransactionId",
                        column: x => x.ExchangeTransactionId,
                        principalTable: "ExchangeTransaction",
                        principalColumn: "TransactionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("966c82e0-13c4-4dff-8b20-53421ffda218"));

            migrationBuilder.CreateIndex(
                name: "IX_BlockchainEvent_ExchangeTransactionId",
                table: "BlockchainEvent",
                column: "ExchangeTransactionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockchainEvent");

            migrationBuilder.DropTable(
                name: "ExchangeTransaction");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("8649db70-89d7-4f5b-a76a-80e71ae2e874"));
        }
    }
}
