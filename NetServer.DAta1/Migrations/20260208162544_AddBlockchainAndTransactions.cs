using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddBlockchainAndTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlockchainEvent_ExchangeTransaction_ExchangeTransactionId",
                table: "BlockchainEvent");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ExchangeTransaction",
                table: "ExchangeTransaction");

            migrationBuilder.RenameTable(
                name: "ExchangeTransaction",
                newName: "Transactions");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions",
                column: "TransactionID");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("26a803ca-5da4-49d4-8e03-0cbed1a566bc"));

            migrationBuilder.InsertData(
                table: "Transactions",
                columns: new[] { "TransactionID", "Amount", "BlockchainTransactionHash", "Currency", "Status", "TimeStamp", "TypeOfTransaction", "UserID" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), 0.5m, "0000000000000000000a7b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", "BTC", "Completed", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Deposit", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.InsertData(
                table: "BlockchainEvent",
                columns: new[] { "EventId", "EventType", "ExchangeTransactionId", "Status", "Timestamp", "TxHash" },
                values: new object[] { new Guid("9651ad0b-80cc-4993-90d5-611317255952"), "Deposit", new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), "Confirmed", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "2d6ea11f-071b-45db-8cc1-e4a31e7ae808" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserID",
                table: "Transactions",
                column: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BlockchainEvent_Transactions_ExchangeTransactionId",
                table: "BlockchainEvent",
                column: "ExchangeTransactionId",
                principalTable: "Transactions",
                principalColumn: "TransactionID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Users_UserID",
                table: "Transactions",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlockchainEvent_Transactions_ExchangeTransactionId",
                table: "BlockchainEvent");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Users_UserID",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_UserID",
                table: "Transactions");

            migrationBuilder.DeleteData(
                table: "BlockchainEvent",
                keyColumn: "EventId",
                keyValue: new Guid("9651ad0b-80cc-4993-90d5-611317255952"));

            migrationBuilder.DeleteData(
                table: "Transactions",
                keyColumn: "TransactionID",
                keyValue: new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"));

            migrationBuilder.RenameTable(
                name: "Transactions",
                newName: "ExchangeTransaction");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ExchangeTransaction",
                table: "ExchangeTransaction",
                column: "TransactionID");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("966c82e0-13c4-4dff-8b20-53421ffda218"));

            migrationBuilder.AddForeignKey(
                name: "FK_BlockchainEvent_ExchangeTransaction_ExchangeTransactionId",
                table: "BlockchainEvent",
                column: "ExchangeTransactionId",
                principalTable: "ExchangeTransaction",
                principalColumn: "TransactionID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
