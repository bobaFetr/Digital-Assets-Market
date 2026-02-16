using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddReferraTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Referral",
                columns: table => new
                {
                    ReferralId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReferrerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReferredId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BonusAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referral", x => x.ReferralId);
                });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("566cb133-e19d-4c3c-86eb-2ae7bb49da4f"));

            migrationBuilder.InsertData(
                table: "Referral",
                columns: new[] { "ReferralId", "BonusAmount", "ReferredId", "ReferrerId", "Timestamp" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), 50.0m, new Guid("2b3c4d5e-6f70-8910-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 12, 5, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Referral");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("307b941d-6f94-4e8f-b9ec-4fc68d3495f2"));
        }
    }
}
