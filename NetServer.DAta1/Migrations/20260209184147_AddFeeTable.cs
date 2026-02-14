using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddFeeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FeeTableId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FeeTable",
                columns: table => new
                {
                    FeeTableId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FeeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FeeAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeTable", x => x.FeeTableId);
                });

            migrationBuilder.InsertData(
                table: "FeeTable",
                columns: new[] { "FeeTableId", "CreatedAt", "FeeAmount", "FeeType", "Symbol", "UpdatedAt" },
                values: new object[] { new Guid("b1c2d3e4-f5a6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 0.1m, "Maker", "BTCUSD", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("307b941d-6f94-4e8f-b9ec-4fc68d3495f2"));

            migrationBuilder.UpdateData(
                table: "Orders",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "FeeTableId",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_FeeTableId",
                table: "Orders",
                column: "FeeTableId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_FeeTable_FeeTableId",
                table: "Orders",
                column: "FeeTableId",
                principalTable: "FeeTable",
                principalColumn: "FeeTableId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_FeeTable_FeeTableId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "FeeTable");

            migrationBuilder.DropIndex(
                name: "IX_Orders_FeeTableId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "FeeTableId",
                table: "Orders");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("1d69833d-67e3-45d4-ac7a-607336fdf719"));
        }
    }
}
