using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NetServer.DAta1.Migrations
{
    /// <inheritdoc />
    public partial class AddFaqReplyAuthor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RepliedByUserId",
                table: "FAQs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "FAQs",
                keyColumn: "FaqId",
                keyValue: new Guid("1a2b3c4d-5e6f-7890-abcd-ef1234567890"),
                column: "RepliedByUserId",
                value: null);

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("88bbe05a-8a7f-4150-86db-926db90f05d7"));

            migrationBuilder.CreateIndex(
                name: "IX_FAQs_RepliedByUserId",
                table: "FAQs",
                column: "RepliedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_FAQs_Users_RepliedByUserId",
                table: "FAQs",
                column: "RepliedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FAQs_Users_RepliedByUserId",
                table: "FAQs");

            migrationBuilder.DropIndex(
                name: "IX_FAQs_RepliedByUserId",
                table: "FAQs");

            migrationBuilder.DropColumn(
                name: "RepliedByUserId",
                table: "FAQs");

            migrationBuilder.UpdateData(
                table: "OrderBookTable",
                keyColumn: "OrderId",
                keyValue: new Guid("23279bc0-3f81-4bbd-b44e-b61b92b01ba4"),
                column: "OrderBookId",
                value: new Guid("f4707fdb-872d-40f1-8423-5a6813d6780e"));
        }
    }
}
