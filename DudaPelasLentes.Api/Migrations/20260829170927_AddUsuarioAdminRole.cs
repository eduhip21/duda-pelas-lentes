using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DudaPelasLentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarioAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Usuários já existentes entram como Admin...
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "UsuariosAdmin",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Admin");

            // ...mas uma base pré-existente precisa manter pelo menos um Master:
            // promove o usuário mais antigo (o de bootstrap) a Master.
            migrationBuilder.Sql(
                """
                UPDATE "UsuariosAdmin"
                SET "Role" = 'Master'
                WHERE "CriadoEm" = (SELECT MIN("CriadoEm") FROM "UsuariosAdmin");
                """);

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosAdmin_Role",
                table: "UsuariosAdmin",
                column: "Role");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UsuariosAdmin_Role",
                table: "UsuariosAdmin");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "UsuariosAdmin");
        }
    }
}
