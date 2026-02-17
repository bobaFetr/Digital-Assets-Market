using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class SeedMoreNews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "NewsTable",
                columns: new[] { "NewsId", "Author", "Content", "CreatedAt", "CreatedBy", "DeletedBy", "DeletedOn", "EditedBy", "EditedOn", "PublishedAt", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("2b3c4d5e-6f70-8910-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "Our trading API now delivers order book snapshots with lower latency and improved depth support for BTCUSD, ETHUSD, and BNBUSD.", new DateTime(2025, 12, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 12, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), "API Upgrade: Faster Order Book", new DateTime(2025, 12, 3, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("3c4d5e6f-7081-9210-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "We added device-aware withdrawal checks and optional 2FA prompts for high-risk activity to better protect your account.", new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 12, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), "Security Notice: New Withdrawal Safeguards", new DateTime(2025, 12, 9, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("4d5e6f70-8192-a210-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "ALGO-EUR spot trading is now live. Review the listing details and start trading with tighter spreads.", new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 12, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "New Listing: ALGO-EUR Spot", new DateTime(2025, 12, 16, 0, 0, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("c219a7a0-a227-44cc-9780-dfe7048431f7"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "NewsTable",
                keyColumn: "NewsId",
                keyValue: new Guid("2b3c4d5e-6f70-8910-abcd-ef1234567890"));

            migrationBuilder.DeleteData(
                table: "NewsTable",
                keyColumn: "NewsId",
                keyValue: new Guid("3c4d5e6f-7081-9210-abcd-ef1234567890"));

            migrationBuilder.DeleteData(
                table: "NewsTable",
                keyColumn: "NewsId",
                keyValue: new Guid("4d5e6f70-8192-a210-abcd-ef1234567890"));

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("73fa16dc-b0d3-4ec6-85b7-b0588001e1d0"));
        }
    }
}
