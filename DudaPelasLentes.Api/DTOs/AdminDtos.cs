using System.ComponentModel.DataAnnotations;

namespace DudaPelasLentes.Api.DTOs;

// ---------- Auth ----------

public sealed record LoginRequestDto
{
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(200)]
    public string Senha { get; init; } = string.Empty;
}

public sealed record LoginResponseDto(string Token, DateTimeOffset ExpiraEm, string Nome, string Email);

public sealed record UsuarioAdminDto(Guid Id, string Nome, string Email, bool Ativo, DateTimeOffset? UltimoLoginEm);

public sealed record AlterarSenhaDto
{
    [Required] public string SenhaAtual { get; init; } = string.Empty;
    [Required, MinLength(8), MaxLength(200)] public string NovaSenha { get; init; } = string.Empty;
}

// ---------- Categorias ----------

public sealed record CategoriaAdminDto(
    Guid Id, string Nome, string Slug, string? Descricao, string? ImagemCapa,
    string? Icone, bool Ativa, int Ordem, int TotalEnsaios);

public sealed record CategoriaUpsertDto
{
    [Required, MaxLength(120)] public string Nome { get; init; } = string.Empty;
    [MaxLength(1000)] public string? Descricao { get; init; }
    [MaxLength(60)] public string? Icone { get; init; }
    public bool Ativa { get; init; } = true;
    public int Ordem { get; init; }
}

// ---------- Ensaios ----------

public sealed record EnsaioAdminDto(
    Guid Id, string Titulo, string Slug, string? Descricao, Guid CategoriaId, string CategoriaNome,
    string? FotoCapa, string? DataEnsaio, string? Local, bool Publicado, bool Destaque, int Ordem,
    int TotalFotos, DateTimeOffset AtualizadoEm);

public sealed record EnsaioUpsertDto
{
    [Required, MaxLength(200)] public string Titulo { get; init; } = string.Empty;
    [Required] public Guid CategoriaId { get; init; }
    [MaxLength(4000)] public string? Descricao { get; init; }
    public string? DataEnsaio { get; init; }
    [MaxLength(200)] public string? Local { get; init; }
    public bool Publicado { get; init; }
    public bool Destaque { get; init; }
    public int Ordem { get; init; }
}

public sealed record FotoAdminDto(
    Guid Id, string Original, string Large, string Medium, string Thumb,
    string? Alt, int Ordem, bool Destaque);

public sealed record FotoUpdateDto
{
    [MaxLength(300)] public string? Alt { get; init; }
    public bool Destaque { get; init; }
}

public sealed record ReordenarDto
{
    [Required] public List<Guid> Ids { get; init; } = [];
}

// ---------- Serviços ----------

public sealed record ServicoAdminDto(
    Guid Id, string Titulo, string Slug, string? DescricaoCurta, string? Descricao,
    string? ImagemCapa, bool Ativo, int Ordem);

public sealed record ServicoUpsertDto
{
    [Required, MaxLength(200)] public string Titulo { get; init; } = string.Empty;
    [MaxLength(500)] public string? DescricaoCurta { get; init; }
    [MaxLength(6000)] public string? Descricao { get; init; }
    public bool Ativo { get; init; } = true;
    public int Ordem { get; init; }
}

// ---------- Depoimentos ----------

public sealed record DepoimentoAdminDto(
    Guid Id, string NomeCliente, string Texto, string? Foto, string? Data,
    bool Ativo, bool Destaque, int Ordem);

public sealed record DepoimentoUpsertDto
{
    [Required, MaxLength(160)] public string NomeCliente { get; init; } = string.Empty;
    [Required, MaxLength(2000)] public string Texto { get; init; } = string.Empty;
    public string? Data { get; init; }
    public bool Ativo { get; init; } = true;
    public bool Destaque { get; init; }
    public int Ordem { get; init; }
}

// ---------- Instagram ----------

public sealed record InstagramFotoAdminDto(
    Guid Id, string Medium, string Thumb, string? Alt, string? LinkExterno, bool Ativo, int Ordem);

public sealed record InstagramFotoUpdateDto
{
    [MaxLength(300)] public string? Alt { get; init; }
    [MaxLength(500)] public string? LinkExterno { get; init; }
    public bool Ativo { get; init; } = true;
    public int Ordem { get; init; }
}

// ---------- Contatos ----------

public sealed record ContatoLeadDto(
    Guid Id, string Nome, string Email, string? WhatsApp, string? TipoEnsaio,
    string Mensagem, string Status, DateTimeOffset CriadoEm, DateTimeOffset? RespondidoEm);

// ---------- Conteúdo / Home ----------

public sealed record ConteudoSiteDto
{
    public string HeroTitulo { get; init; } = "";
    public string HeroTituloDestaque { get; init; } = "";
    public string HeroSubtitulo { get; init; } = "";
    public string? HeroImagem { get; init; }
    public string HeroBotaoPrimarioTexto { get; init; } = "";
    public string HeroBotaoPrimarioLink { get; init; } = "";
    public string HeroBotaoSecundarioTexto { get; init; } = "";
    public bool HeroBotaoSecundarioWhatsApp { get; init; } = true;

    public string SobreTitulo { get; init; } = "";
    public string SobreSaudacao { get; init; } = "";
    public string SobreTextoResumo { get; init; } = "";
    public string? SobreImagem { get; init; }
    public string SobreBotaoTexto { get; init; } = "";
    public string SobrePaginaTexto { get; init; } = "";
    public string SobrePaginaTextoComplementar { get; init; } = "";

    public string CtaTitulo { get; init; } = "";
    public string CtaTexto { get; init; } = "";
    public string CtaBotaoTexto { get; init; } = "";
    public string? CtaImagem { get; init; }

    public string HistoriasTitulo { get; init; } = "";
    public string MomentosTitulo { get; init; } = "";
    public string DepoimentosTitulo { get; init; } = "";
    public string InstagramTitulo { get; init; } = "";
}

public sealed record ConfiguracaoSiteDto
{
    [Required, MaxLength(120)] public string NomeMarca { get; init; } = "";
    [MaxLength(100)] public string? Instagram { get; init; }
    [MaxLength(40)] public string? WhatsApp { get; init; }
    [MaxLength(500)] public string MensagemWhatsApp { get; init; } = "";
    [MaxLength(200)] public string? Email { get; init; }
    [MaxLength(120)] public string? Cidade { get; init; }
    [MaxLength(200)] public string? RegiaoAtendida { get; init; }
    public int DesdeAno { get; init; } = 2017;
    public string? Logo { get; init; }
    public string? Favicon { get; init; }
    public string? ImagemSocial { get; init; }
    [MaxLength(200)] public string SeoTitle { get; init; } = "";
    [MaxLength(400)] public string SeoDescription { get; init; } = "";
    [MaxLength(600)] public string TextoRodape { get; init; } = "";
}

// ---------- Dashboard ----------

public sealed record DashboardDto(
    int EnsaiosPublicados,
    int TotalFotografias,
    int Categorias,
    int DepoimentosAtivos,
    int NovosContatos);

// ---------- Upload ----------

public sealed record UploadResultDto(
    string Original, string Large, string Medium, string Thumb, int Largura, int Altura);
