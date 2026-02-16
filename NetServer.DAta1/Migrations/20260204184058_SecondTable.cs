using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class SecondTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WalletTable",
                columns: table => new
                {
                    WalletID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Addres = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WalletTableWalletID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletTable", x => x.WalletID);
                    table.ForeignKey(
                        name: "FK_WalletTable_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WalletTable_WalletTable_WalletTableWalletID",
                        column: x => x.WalletTableWalletID,
                        principalTable: "WalletTable",
                        principalColumn: "WalletID");
                });

            migrationBuilder.InsertData(
                table: "WalletTable",
                columns: new[] { "WalletID", "Addres", "Balance", "CreatedAt", "Currency", "Status", "UserId", "WalletTableWalletID" },
                values: new object[] { new Guid("3249fc5e-7cd9-49ab-87db-c581a24f0938"), "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", 1.5m, new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "BTC", "Active", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), null });

            migrationBuilder.CreateIndex(
                name: "IX_WalletTable_UserId",
                table: "WalletTable",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTable_WalletTableWalletID",
                table: "WalletTable",
                column: "WalletTableWalletID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WalletTable");
        }
    }
}
