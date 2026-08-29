using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DudaPelasLentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categorias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Slug = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ImagemCapa = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Icone = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    Ativa = table.Column<bool>(type: "boolean", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categorias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConfiguracaoSite",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    NomeMarca = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Instagram = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    WhatsApp = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MensagemWhatsApp = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Email = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Cidade = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RegiaoAtendida = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DesdeAno = table.Column<int>(type: "integer", nullable: false),
                    Logo = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Favicon = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ImagemSocial = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    SeoTitle = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    SeoDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    TextoRodape = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracaoSite", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContatoLeads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    WhatsApp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    TipoEnsaio = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Mensagem = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    RespondidoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContatoLeads", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConteudoSite",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    HeroTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    HeroTituloDestaque = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    HeroSubtitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    HeroImagem = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    HeroBotaoPrimarioTexto = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    HeroBotaoPrimarioLink = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    HeroBotaoSecundarioTexto = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    HeroBotaoSecundarioWhatsApp = table.Column<bool>(type: "boolean", nullable: false),
                    SobreTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    SobreSaudacao = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    SobreTextoResumo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    SobreImagem = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    SobreBotaoTexto = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    SobrePaginaTexto = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    SobrePaginaTextoComplementar = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CtaTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CtaTexto = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CtaBotaoTexto = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CtaImagem = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    HistoriasTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    MomentosTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    DepoimentosTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    InstagramTitulo = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConteudoSite", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Depoimentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NomeCliente = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Texto = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Foto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Data = table.Column<DateOnly>(type: "date", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    Destaque = table.Column<bool>(type: "boolean", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Depoimentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InstagramFotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ArquivoMedium = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ArquivoThumb = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Alt = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    LinkExterno = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstagramFotos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Servicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: false),
                    DescricaoCurta = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Descricao = table.Column<string>(type: "character varying(6000)", maxLength: 6000, nullable: true),
                    ImagemCapa = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Servicos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UsuariosAdmin",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SenhaHash = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    UltimoLoginEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuariosAdmin", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ensaios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(240)", maxLength: 240, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    CategoriaId = table.Column<Guid>(type: "uuid", nullable: false),
                    FotoCapa = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DataEnsaio = table.Column<DateOnly>(type: "date", nullable: true),
                    Local = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Publicado = table.Column<bool>(type: "boolean", nullable: false),
                    Destaque = table.Column<bool>(type: "boolean", nullable: false),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ensaios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ensaios_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Fotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EnsaioId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArquivoOriginal = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ArquivoLarge = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ArquivoMedium = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ArquivoThumb = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Alt = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Ordem = table.Column<int>(type: "integer", nullable: false),
                    Destaque = table.Column<bool>(type: "boolean", nullable: false),
                    Largura = table.Column<int>(type: "integer", nullable: true),
                    Altura = table.Column<int>(type: "integer", nullable: true),
                    CriadoEm = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Fotos_Ensaios_EnsaioId",
                        column: x => x.EnsaioId,
                        principalTable: "Ensaios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categorias_Slug",
                table: "Categorias",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContatoLeads_Status_CriadoEm",
                table: "ContatoLeads",
                columns: new[] { "Status", "CriadoEm" });

            migrationBuilder.CreateIndex(
                name: "IX_Depoimentos_Ativo_Ordem",
                table: "Depoimentos",
                columns: new[] { "Ativo", "Ordem" });

            migrationBuilder.CreateIndex(
                name: "IX_Ensaios_CategoriaId",
                table: "Ensaios",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ensaios_Destaque",
                table: "Ensaios",
                column: "Destaque");

            migrationBuilder.CreateIndex(
                name: "IX_Ensaios_Publicado_Ordem",
                table: "Ensaios",
                columns: new[] { "Publicado", "Ordem" });

            migrationBuilder.CreateIndex(
                name: "IX_Ensaios_Slug",
                table: "Ensaios",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Fotos_Destaque",
                table: "Fotos",
                column: "Destaque");

            migrationBuilder.CreateIndex(
                name: "IX_Fotos_EnsaioId_Ordem",
                table: "Fotos",
                columns: new[] { "EnsaioId", "Ordem" });

            migrationBuilder.CreateIndex(
                name: "IX_InstagramFotos_Ativo_Ordem",
                table: "InstagramFotos",
                columns: new[] { "Ativo", "Ordem" });

            migrationBuilder.CreateIndex(
                name: "IX_Servicos_Ativo_Ordem",
                table: "Servicos",
                columns: new[] { "Ativo", "Ordem" });

            migrationBuilder.CreateIndex(
                name: "IX_Servicos_Slug",
                table: "Servicos",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UsuariosAdmin_Email",
                table: "UsuariosAdmin",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracaoSite");

            migrationBuilder.DropTable(
                name: "ContatoLeads");

            migrationBuilder.DropTable(
                name: "ConteudoSite");

            migrationBuilder.DropTable(
                name: "Depoimentos");

            migrationBuilder.DropTable(
                name: "Fotos");

            migrationBuilder.DropTable(
                name: "InstagramFotos");

            migrationBuilder.DropTable(
                name: "Servicos");

            migrationBuilder.DropTable(
                name: "UsuariosAdmin");

            migrationBuilder.DropTable(
                name: "Ensaios");

            migrationBuilder.DropTable(
                name: "Categorias");
        }
    }
}
