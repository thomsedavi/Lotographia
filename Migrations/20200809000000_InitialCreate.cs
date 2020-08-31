using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Lotographia.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PaperFolliesGames",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(maxLength: 255, nullable: false),
                    Title = table.Column<string>(maxLength: 255, nullable: false),
                    Description = table.Column<string>(maxLength: 4000, nullable: true),
                    Flags = table.Column<int>(nullable: false),
                    CharacterLimit = table.Column<int>(nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "getdate()"),
                    EndedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaperFolliesGames", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PaperFolliesParticipants",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(maxLength: 255, nullable: false),
                    Biography = table.Column<string>(maxLength: 4000, nullable: true),
                    Flags = table.Column<int>(nullable: false),
                    Content = table.Column<string>(maxLength: 4000, nullable: true),
                    ContentIndex = table.Column<int>(nullable: false),
                    ContentVersion = table.Column<int>(nullable: false),
                    HashedPassword = table.Column<string>(maxLength: 255, nullable: true),
                    GameId = table.Column<long>(nullable: false),
                    PrecedingPlayerId = table.Column<long>(nullable: true),
                    FollowingPlayerId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaperFolliesParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaperFolliesParticipants_PaperFolliesParticipants_FollowingPlayerId",
                        column: x => x.FollowingPlayerId,
                        principalTable: "PaperFolliesParticipants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PaperFolliesParticipants_PaperFolliesGames_GameId",
                        column: x => x.GameId,
                        principalTable: "PaperFolliesGames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PaperFolliesParticipants_PaperFolliesParticipants_PrecedingPlayerId",
                        column: x => x.PrecedingPlayerId,
                        principalTable: "PaperFolliesParticipants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaperFolliesGames_Code",
                table: "PaperFolliesGames",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaperFolliesParticipants_FollowingPlayerId",
                table: "PaperFolliesParticipants",
                column: "FollowingPlayerId",
                unique: true,
                filter: "[FollowingPlayerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PaperFolliesParticipants_GameId",
                table: "PaperFolliesParticipants",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_PaperFolliesParticipants_PrecedingPlayerId",
                table: "PaperFolliesParticipants",
                column: "PrecedingPlayerId",
                unique: true,
                filter: "[PrecedingPlayerId] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaperFolliesParticipants");

            migrationBuilder.DropTable(
                name: "PaperFolliesGames");
        }
    }
}
