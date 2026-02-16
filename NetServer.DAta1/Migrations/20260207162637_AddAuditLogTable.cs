using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderBookTable",
                table: "OrderBookTable");

            migrationBuilder.DropIndex(
                name: "IX_OrderBookTable_OrderId",
                table: "OrderBookTable");

            migrationBuilder.DeleteData(
                table: "OrderBookTable",
                keyColumn: "OrderBookId",
                keyValue: new Guid("9be10ead-9897-4083-aa15-6fbabd8ff701"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderBookTable",
                table: "OrderBookTable",
                column: "OrderId");

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    LogId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
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

            migrationBuilder.InsertData(
                table: "OrderBookTable",
                columns: new[] { "OrderId", "Amount", "OrderBookId", "Price", "Symbol", "Timestamp" },
                values: new object[] { new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 0.1m, new Guid("11b06dc3-27cc-4f23-b730-7f9ab56788e4"), 50000.0m, "BTCUSD", new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OrderBookTable",
                table: "OrderBookTable");

            migrationBuilder.DeleteData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_OrderBookTable",
                table: "OrderBookTable",
                column: "OrderBookId");

            migrationBuilder.InsertData(
                table: "OrderBookTable",
                columns: new[] { "OrderBookId", "Amount", "OrderId", "Price", "Symbol", "Timestamp" },
                values: new object[] { new Guid("9be10ead-9897-4083-aa15-6fbabd8ff701"), 0.1m, new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 50000.0m, "BTCUSD", new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.CreateIndex(
                name: "IX_OrderBookTable_OrderId",
                table: "OrderBookTable",
                column: "OrderId",
                unique: true);
        }
    }
}
