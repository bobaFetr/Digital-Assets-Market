using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddKycIdentityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlockchainEvent_Transactions_ExchangeTransactionId",
                table: "BlockchainEvent");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_FeeTable_FeeTableId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Referral",
                table: "Referral");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FeeTable",
                table: "FeeTable");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BlockchainEvent",
                table: "BlockchainEvent");

            migrationBuilder.RenameTable(
                name: "Referral",
                newName: "Referrals");

            migrationBuilder.RenameTable(
                name: "FeeTable",
                newName: "FeeTables");

            migrationBuilder.RenameTable(
                name: "BlockchainEvent",
                newName: "BlockchainEvents");

            migrationBuilder.RenameIndex(
                name: "IX_BlockchainEvent_ExchangeTransactionId",
                table: "BlockchainEvents",
                newName: "IX_BlockchainEvents_ExchangeTransactionId");

            migrationBuilder.AddColumn<string>(
                name: "CountryOfResidence",
                table: "KycDocuments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "KycDocuments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "KycDocuments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Referrals",
                table: "Referrals",
                column: "ReferralId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FeeTables",
                table: "FeeTables",
                column: "FeeTableId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BlockchainEvents",
                table: "BlockchainEvents",
                column: "EventId");

            migrationBuilder.UpdateData(
                table: "KycDocuments",
                keyColumn: "DocId",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                columns: new[] { "CountryOfResidence", "DateOfBirth", "FilePath", "FullName", "UserId" },
                values: new object[] { "BG", new DateTime(1994, 5, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "/path/to/document1.pdf", "Alice Example", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("35e097d8-1b1f-4dcf-96e3-c54b58673b88"));

            migrationBuilder.AddForeignKey(
                name: "FK_BlockchainEvents_Transactions_ExchangeTransactionId",
                table: "BlockchainEvents",
                column: "ExchangeTransactionId",
                principalTable: "Transactions",
                principalColumn: "TransactionID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_FeeTables_FeeTableId",
                table: "Orders",
                column: "FeeTableId",
                principalTable: "FeeTables",
                principalColumn: "FeeTableId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlockchainEvents_Transactions_ExchangeTransactionId",
                table: "BlockchainEvents");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_FeeTables_FeeTableId",
                table: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Referrals",
                table: "Referrals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FeeTables",
                table: "FeeTables");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BlockchainEvents",
                table: "BlockchainEvents");

            migrationBuilder.DropColumn(
                name: "CountryOfResidence",
                table: "KycDocuments");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "KycDocuments");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "KycDocuments");

            migrationBuilder.RenameTable(
                name: "Referrals",
                newName: "Referral");

            migrationBuilder.RenameTable(
                name: "FeeTables",
                newName: "FeeTable");

            migrationBuilder.RenameTable(
                name: "BlockchainEvents",
                newName: "BlockchainEvent");

            migrationBuilder.RenameIndex(
                name: "IX_BlockchainEvents_ExchangeTransactionId",
                table: "BlockchainEvent",
                newName: "IX_BlockchainEvent_ExchangeTransactionId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Referral",
                table: "Referral",
                column: "ReferralId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_FeeTable",
                table: "FeeTable",
                column: "FeeTableId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BlockchainEvent",
                table: "BlockchainEvent",
                column: "EventId");

            migrationBuilder.UpdateData(
                table: "KycDocuments",
                keyColumn: "DocId",
                keyValue: new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
                columns: new[] { "FilePath", "UserId" },
                values: new object[] { "A12345678", new Guid("00000000-0000-0000-0000-000000000000") });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("566cb133-e19d-4c3c-86eb-2ae7bb49da4f"));

            migrationBuilder.AddForeignKey(
                name: "FK_BlockchainEvent_Transactions_ExchangeTransactionId",
                table: "BlockchainEvent",
                column: "ExchangeTransactionId",
                principalTable: "Transactions",
                principalColumn: "TransactionID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_FeeTable_FeeTableId",
                table: "Orders",
                column: "FeeTableId",
                principalTable: "FeeTable",
                principalColumn: "FeeTableId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
