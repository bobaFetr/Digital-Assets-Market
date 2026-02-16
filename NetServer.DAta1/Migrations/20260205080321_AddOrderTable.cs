using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WalletTable_Users_UserId",
                table: "WalletTable");

            migrationBuilder.DropForeignKey(
                name: "FK_WalletTable_WalletTable_WalletTableWalletID",
                table: "WalletTable");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WalletTable",
                table: "WalletTable");

            migrationBuilder.RenameTable(
                name: "WalletTable",
                newName: "Wallets");

            migrationBuilder.RenameIndex(
                name: "IX_WalletTable_WalletTableWalletID",
                table: "Wallets",
                newName: "IX_Wallets_WalletTableWalletID");

            migrationBuilder.RenameIndex(
                name: "IX_WalletTable_UserId",
                table: "Wallets",
                newName: "IX_Wallets_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Wallets",
                table: "Wallets",
                column: "WalletID");

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TypeOfOrder = table.Column<int>(type: "int", nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    OrderStatus = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Orders",
                columns: new[] { "OrderId", "Amount", "CreatedAt", "OrderStatus", "Price", "Symbol", "TypeOfOrder", "UserId" },
                values: new object[] { new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 0.1m, new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 50000.0m, "BTCUSD", 0, new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Wallets_Users_UserId",
                table: "Wallets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Wallets_Wallets_WalletTableWalletID",
                table: "Wallets",
                column: "WalletTableWalletID",
                principalTable: "Wallets",
                principalColumn: "WalletID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wallets_Users_UserId",
                table: "Wallets");

            migrationBuilder.DropForeignKey(
                name: "FK_Wallets_Wallets_WalletTableWalletID",
                table: "Wallets");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Wallets",
                table: "Wallets");

            migrationBuilder.RenameTable(
                name: "Wallets",
                newName: "WalletTable");

            migrationBuilder.RenameIndex(
                name: "IX_Wallets_WalletTableWalletID",
                table: "WalletTable",
                newName: "IX_WalletTable_WalletTableWalletID");

            migrationBuilder.RenameIndex(
                name: "IX_Wallets_UserId",
                table: "WalletTable",
                newName: "IX_WalletTable_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WalletTable",
                table: "WalletTable",
                column: "WalletID");

            migrationBuilder.AddForeignKey(
                name: "FK_WalletTable_Users_UserId",
                table: "WalletTable",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WalletTable_WalletTable_WalletTableWalletID",
                table: "WalletTable",
                column: "WalletTableWalletID",
                principalTable: "WalletTable",
                principalColumn: "WalletID");
        }
    }
}
