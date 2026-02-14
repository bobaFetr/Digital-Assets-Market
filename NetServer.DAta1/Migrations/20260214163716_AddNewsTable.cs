using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddNewsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NewsTable",
                columns: table => new
                {
                    NewsId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Author = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EditedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EditedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsTable", x => x.NewsId);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_Author",
                        column: x => x.Author,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_DeletedBy",
                        column: x => x.DeletedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NewsTable_Users_EditedBy",
                        column: x => x.EditedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "NewsTable",
                columns: new[] { "NewsId", "Author", "Content", "CreatedAt", "CreatedBy", "DeletedBy", "DeletedOn", "EditedBy", "EditedOn", "PublishedAt", "Title", "UpdatedAt" },
                values: new object[] { new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), "We are excited to announce the release of margin trading on our platform. Users can now trade with leverage up to 5x on selected pairs.", new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 11, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "New Feature Release: Margin Trading", new DateTime(2025, 11, 29, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("73fa16dc-b0d3-4ec6-85b7-b0588001e1d0"));

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_Author",
                table: "NewsTable",
                column: "Author");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_CreatedBy",
                table: "NewsTable",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_DeletedBy",
                table: "NewsTable",
                column: "DeletedBy");

            migrationBuilder.CreateIndex(
                name: "IX_NewsTable_EditedBy",
                table: "NewsTable",
                column: "EditedBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NewsTable");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("4efa6c0b-e66d-477b-981b-d587e15b0a63"));
        }
    }
}
