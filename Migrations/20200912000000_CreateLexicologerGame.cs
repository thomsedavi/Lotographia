using Microsoft.EntityFrameworkCore.Migrations;

namespace Lotographia.Migrations
{
    public partial class CreateLexicologerGame : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LexicologerGames",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(maxLength: 255, nullable: true),
                    Details = table.Column<string>(maxLength: 4000, nullable: true),
                    CharacterLimit = table.Column<int>(nullable: false),
                    Words = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LexicologerGames", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LexicologerGames");
        }
    }
}
