using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class BancAccountsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DollarBankAccounts",
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
                    table.PrimaryKey("PK_DollarBankAccounts", x => x.BankAccountId);
                    table.ForeignKey(
                        name: "FK_DollarBankAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EuroBankAccounts",
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
                    table.PrimaryKey("PK_EuroBankAccounts", x => x.BankAccountId);
                    table.ForeignKey(
                        name: "FK_EuroBankAccounts_Users_UserId",
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
                value: new Guid("392b7739-193b-4261-8f09-3a52dca07e1c"));

            migrationBuilder.CreateIndex(
                name: "IX_DollarBankAccounts_UserId",
                table: "DollarBankAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EuroBankAccounts_UserId",
                table: "EuroBankAccounts",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DollarBankAccounts");

            migrationBuilder.DropTable(
                name: "EuroBankAccounts");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("6172ea6f-ebb1-4f3d-8fcb-449668255501"));
        }
    }
}
