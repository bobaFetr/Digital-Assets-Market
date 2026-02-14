using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class SeedAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AuditLogs",
                columns: new[] { "LogId", "Action", "Details", "Timestamp", "UserId" },
                values: new object[] { new Guid("23116bf4-42b9-4d37-8569-f8a21e4b5265"), "User Login", "User Alice logged in successfully.", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("8649db70-89d7-4f5b-a76a-80e71ae2e874"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AuditLogs",
                keyColumn: "LogId",
                keyValue: new Guid("23116bf4-42b9-4d37-8569-f8a21e4b5265"));

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("11b06dc3-27cc-4f23-b730-7f9ab56788e4"));
        }
    }
}
