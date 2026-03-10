using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddBankAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BankAccounts",
                columns: table => new
                {
                    BankAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountHolderName = table.Column<string>(type: "text", nullable: false),
                    BankName = table.Column<string>(type: "text", nullable: false),
                    Iban = table.Column<string>(type: "text", nullable: false),
                    SwiftCode = table.Column<string>(type: "text", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankAccounts", x => x.BankAccountId);
                    table.ForeignKey(
                        name: "FK_BankAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("6172ea6f-ebb1-4f3d-8fcb-449668255501"));

            migrationBuilder.UpdateData(
                table: "Sessions",
                keyColumn: "SessionId",
                keyValue: new Guid("c0733dc5-908b-42fd-8623-8cba9e9b1b7b"),
                column: "IpAddress",
                value: "127.0.0.1");

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_UserId",
                table: "BankAccounts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BankAccounts");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("155e07f5-04a6-4257-a5ac-bcc619aa3375"));

            migrationBuilder.UpdateData(
                table: "Sessions",
                keyColumn: "SessionId",
                keyValue: new Guid("c0733dc5-908b-42fd-8623-8cba9e9b1b7b"),
                column: "IpAddress",
                value: "89234.98324.2394.2948");
        }
    }
}
