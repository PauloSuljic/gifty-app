using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gifty.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWishlistItemDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "WishlistItems",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "WishlistItems");
        }
    }
}
