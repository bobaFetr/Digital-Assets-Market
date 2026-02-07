using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KycDocument_Users_UserId",
                table: "KycDocument");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KycDocument",
                table: "KycDocument");

            migrationBuilder.Sql("DELETE FROM OrderBookTable WHERE OrderId = '23279bc0-3f81-4bbd-b44e-b61b92b01ba4'");

            migrationBuilder.RenameTable(
                name: "KycDocument",
                newName: "KycDocuments");

            migrationBuilder.RenameIndex(
                name: "IX_KycDocument_UserId",
                table: "KycDocuments",
                newName: "IX_KycDocuments_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_KycDocuments",
                table: "KycDocuments",
                column: "DocId");

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceInfo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.SessionId);
                    table.ForeignKey(
                        name: "FK_Sessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "OrderBookTable",
                columns: new[] { "OrderBookId", "Amount", "OrderId", "Price", "Symbol", "Timestamp" },
                values: new object[] { new Guid("9be10ead-9897-4083-aa15-6fbabd8ff701"), 0.1m, new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 50000.0m, "BTCUSD", new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.InsertData(
                table: "Sessions",
                columns: new[] { "SessionId", "CreatedAt", "DeviceInfo", "ExpiresAt", "IpAddress", "Token", "UserId" },
                values: new object[] { new Guid("c0733dc5-908b-42fd-8623-8cba9e9b1b7b"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3", new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "89234.98324.2394.2948", "sample_token", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890") });

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_UserId",
                table: "Sessions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_KycDocuments_Users_UserId",
                table: "KycDocuments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KycDocuments_Users_UserId",
                table: "KycDocuments");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KycDocuments",
                table: "KycDocuments");

            migrationBuilder.DeleteData(
                table: "OrderBookTable",
                keyColumn: "OrderBookId",
                keyValue: new Guid("9be10ead-9897-4083-aa15-6fbabd8ff701"));

            migrationBuilder.RenameTable(
                name: "KycDocuments",
                newName: "KycDocument");

            migrationBuilder.RenameIndex(
                name: "IX_KycDocuments_UserId",
                table: "KycDocument",
                newName: "IX_KycDocument_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_KycDocument",
                table: "KycDocument",
                column: "DocId");

            migrationBuilder.InsertData(
                table: "OrderBookTable",
                columns: new[] { "OrderBookId", "Amount", "OrderId", "Price", "Symbol", "Timestamp" },
                values: new object[] { new Guid("658e7a5c-6e02-4d31-a098-ee6b3dfedbb4"), 0.1m, new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 50000.0m, "BTCUSD", new DateTime(2025, 8, 28, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.AddForeignKey(
                name: "FK_KycDocument_Users_UserId",
                table: "KycDocument",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
