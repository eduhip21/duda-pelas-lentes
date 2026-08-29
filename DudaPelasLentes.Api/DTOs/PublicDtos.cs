namespace DudaPelasLentes.Api.DTOs;

// ---------- Blocos reutilizáveis ----------

public sealed record ConfiguracaoPublicaDto(
    string NomeMarca,
    string? Instagram,
    string? InstagramUrl,
    string? WhatsAppUrl,
    string? Email,
    string? Cidade,
    string? RegiaoAtendida,
    int DesdeAno,
    string? Logo,
    string TextoRodape,
    string SeoTitle,
    string SeoDescription,
    string? ImagemSocial);

public sealed record CategoriaPublicaDto(
    Guid Id,
    string Nome,
    string Slug,
    string? Descricao,
    string? ImagemCapa,
    string? Icone,
    int Ordem);

public sealed record FotoPublicaDto(
    Guid Id,
    string Large,
    string Medium,
    string Thumb,
    string? Alt,
    int Ordem);

public sealed record DepoimentoPublicoDto(
    Guid Id,
    string NomeCliente,
    string Texto,
    string? Foto,
    string? Data);

public sealed record InstagramFotoPublicaDto(
    Guid Id,
    string Medium,
    string Thumb,
    string? Alt,
    string? LinkExterno);

public sealed record ServicoPublicoDto(
    Guid Id,
    string Titulo,
    string Slug,
    string? DescricaoCurta,
    string? Descricao,
    string? ImagemCapa,
    int Ordem);

// ---------- Home agregada ----------

public sealed record HomeHeroDto(
    string Titulo,
    string TituloDestaque,
    string Subtitulo,
    string? Imagem,
    string BotaoPrimarioTexto,
    string BotaoPrimarioLink,
    string BotaoSecundarioTexto,
    bool BotaoSecundarioWhatsApp);

public sealed record HomeSobreResumoDto(
    string Titulo,
    string Saudacao,
    string Texto,
    string? Imagem,
    string BotaoTexto);

public sealed record HomeCtaDto(
    string Titulo,
    string Texto,
    string BotaoTexto,
    string? Imagem);

public sealed record HomeSecoesDto(
    string Historias,
    string Momentos,
    string Depoimentos,
    string Instagram);

public sealed record HomeDto(
    HomeHeroDto Hero,
    HomeSobreResumoDto Sobre,
    HomeCtaDto Cta,
    HomeSecoesDto Titulos,
    IReadOnlyList<CategoriaPublicaDto> Categorias,
    IReadOnlyList<FotoPublicaDto> Destaques,
    IReadOnlyList<DepoimentoPublicoDto> Depoimentos,
    IReadOnlyList<InstagramFotoPublicaDto> Instagram,
    ConfiguracaoPublicaDto Configuracoes);

// ---------- Sobre (página completa) ----------

public sealed record SobrePaginaDto(
    string Titulo,
    string Saudacao,
    string TextoResumo,
    string TextoPagina,
    string TextoComplementar,
    string? Imagem);

// ---------- Portfólio ----------

public sealed record EnsaioResumoDto(
    Guid Id,
    string Titulo,
    string Slug,
    string? Descricao,
    string CategoriaSlug,
    string CategoriaNome,
    string? FotoCapa,
    string? DataEnsaio,
    string? Local,
    bool Destaque,
    int Ordem);

public sealed record PortfolioListaDto(
    IReadOnlyList<CategoriaPublicaDto> Categorias,
    IReadOnlyList<EnsaioResumoDto> Ensaios);

public sealed record EnsaioDetalheDto(
    Guid Id,
    string Titulo,
    string Slug,
    string? Descricao,
    string CategoriaSlug,
    string CategoriaNome,
    string? FotoCapa,
    string? DataEnsaio,
    string? Local,
    IReadOnlyList<FotoPublicaDto> Fotos);

// ---------- Contato ----------

public sealed record ContatoRequestDto
{
    public string Nome { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string? WhatsApp { get; init; }
    public string? TipoEnsaio { get; init; }
    public string Mensagem { get; init; } = string.Empty;
    /// <summary>Honeypot: precisa chegar vazio. Bots preenchem.</summary>
    public string? Website { get; init; }
}
