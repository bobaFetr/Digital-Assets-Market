using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddFAQTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FAQs",
                columns: table => new
                {
                    FaqId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FAQs", x => x.FaqId);
                    table.ForeignKey(
                        name: "FK_FAQs_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "FAQs",
                columns: new[] { "FaqId", "Answer", "AuthorId", "CategoryId", "CreatedAt", "PublishedAt", "Question", "UpdatedAt" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), "To create an account, click on the Sign Up button and fill in the required information.", new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("12345678-90ab-cdef-1234-567890abcdef"), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "How to create an account?", new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("4efa6c0b-e66d-477b-981b-d587e15b0a63"));

            migrationBuilder.CreateIndex(
                name: "IX_FAQs_AuthorId",
                table: "FAQs",
                column: "AuthorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FAQs");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("35e097d8-1b1f-4dcf-96e3-c54b58673b88"));
        }
    }
}
