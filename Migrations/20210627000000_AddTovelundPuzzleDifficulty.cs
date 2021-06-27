using Microsoft.EntityFrameworkCore.Migrations;

namespace Lotographia.Migrations
{
    public partial class AddTovelundPuzzleDifficulty : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "Difficulty",
                table: "TovelundPuzzles",
                nullable: false,
                defaultValue: (byte)1);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "TovelundPuzzles");
        }
    }
}
