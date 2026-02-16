using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddKycDocumentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "OrderBookTable",
                keyColumn: "OrderBookId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"));

            migrationBuilder.CreateTable(
                name: "KycDocument",
                columns: table => new
                {
                    DocId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KycDocument", x => x.DocId);
                    table.ForeignKey(
                        name: "FK_KycDocument_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "KycDocument",
                columns: new[] { "DocId", "DocumentNumber", "ExpiryDate", "FilePath", "Status", "Type", "UploadedAt", "UserId" },
                values: new object[] { 
                    new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), 
                    "A12345678", 
                    new DateTime(2030, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 
                    "A12345678", 
                    "Pending", 
                    "Passport", 
                    new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), 
                    new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890")  // Use User1Id instead of all zeros
                });

            migrationBuilder.CreateIndex(
                name: "IX_KycDocument_UserId",
                table: "KycDocument",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KycDocument");

            migrationBuilder.DeleteData(
                table: "OrderBookTable",
                keyColumn: "OrderBookId",
                keyValue: new Guid("658e7a5c-6e02-4d31-a098-ee6b3dfedbb4"));

            migrationBuilder.InsertData(
                table: "OrderBookTable",
                columns: new[] { "OrderBookId", "Amount", "OrderId", "Price", "Symbol", "Timestamp" },
                values: new object[] { new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"), 0.1m, new Guid("00000000-0000-0000-0000-000000000000"), 50000.0m, "BTCUSD", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }
    }
}
