namespace DudaPelasLentes.Api.Entities;

/// <summary>Serviço oferecido pela fotógrafa. CRUD administrável, página pública /servicos.</summary>
public class Servico
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Titulo { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? DescricaoCurta { get; set; }
    public string? Descricao { get; set; }
    public string? ImagemCapa { get; set; }
    public bool Ativo { get; set; } = true;
    public int Ordem { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>Depoimento de cliente exibido no carrossel "Palavras de quem viveu".</summary>
public class Depoimento
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NomeCliente { get; set; } = string.Empty;
    public string Texto { get; set; } = string.Empty;
    public string? Foto { get; set; }
    public DateOnly? Data { get; set; }
    public bool Ativo { get; set; } = true;
    public bool Destaque { get; set; }
    public int Ordem { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>Imagem selecionada manualmente para a grade "Me acompanhe no Instagram".</summary>
public class InstagramFoto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ArquivoMedium { get; set; } = string.Empty;
    public string ArquivoThumb { get; set; } = string.Empty;
    public string? Alt { get; set; }
    public string? LinkExterno { get; set; }
    public bool Ativo { get; set; } = true;
    public int Ordem { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
}

public enum ContatoLeadStatus
{
    Novo = 0,
    Respondido = 1,
    Arquivado = 2
}

/// <summary>Lead recebido pelo formulário público de contato.</summary>
public class ContatoLead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? WhatsApp { get; set; }
    public string? TipoEnsaio { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public ContatoLeadStatus Status { get; set; } = ContatoLeadStatus.Novo;
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RespondidoEm { get; set; }
}

/// <summary>
/// Conteúdo editável da Home e seções institucionais. Linha única (singleton) para
/// evitar que a fotógrafa precise recompilar o front ao trocar uma foto ou texto.
/// </summary>
public class ConteudoSite
{
    public int Id { get; set; } = 1;

    // Hero
    public string HeroTitulo { get; set; } = "DUDA";
    public string HeroTituloDestaque { get; set; } = "PELAS LENTES";
    public string HeroSubtitulo { get; set; } =
        "Eternizando momentos desde 2017.\nRetratos para diferentes fases da vida.";
    public string? HeroImagem { get; set; }
    public string HeroBotaoPrimarioTexto { get; set; } = "Conheça meu portfólio";
    public string HeroBotaoPrimarioLink { get; set; } = "/portfolio";
    public string HeroBotaoSecundarioTexto { get; set; } = "Agendar pelo WhatsApp";
    public bool HeroBotaoSecundarioWhatsApp { get; set; } = true;

    // Sobre (resumo na Home)
    public string SobreTitulo { get; set; } = "Sobre a fotógrafa";
    public string SobreSaudacao { get; set; } = "Olá, eu sou a Duda.";
    public string SobreTextoResumo { get; set; } =
        "Apaixonada por contar histórias através da luz, do olhar e dos detalhes. "
        + "Meu propósito é transformar momentos em memórias que serão lembradas para sempre. "
        + "Cada fase da vida merece ser vivida e registrada de forma única e verdadeira.";
    public string? SobreImagem { get; set; }
    public string SobreBotaoTexto { get; set; } = "Conheça minha história";

    // Sobre (página completa /sobre)
    public string SobrePaginaTexto { get; set; } = string.Empty;
    public string SobrePaginaTextoComplementar { get; set; } = string.Empty;

    // CTA "Vamos criar memórias?"
    public string CtaTitulo { get; set; } = "Vamos criar memórias?";
    public string CtaTexto { get; set; } = "Será um prazer registrar o seu momento!";
    public string CtaBotaoTexto { get; set; } = "Conversar pelo WhatsApp";
    public string? CtaImagem { get; set; }

    // Seções da Home
    public string HistoriasTitulo { get; set; } = "Histórias pelas lentes";
    public string MomentosTitulo { get; set; } = "Momentos que ficam";
    public string DepoimentosTitulo { get; set; } = "Palavras de quem viveu";
    public string InstagramTitulo { get; set; } = "Me acompanhe no Instagram";

    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;
}

/// <summary>Configurações gerais do site (marca, contato, SEO). Linha única (singleton).</summary>
public class ConfiguracaoSite
{
    public int Id { get; set; } = 1;

    public string NomeMarca { get; set; } = "Duda Pelas Lentes";
    public string? Instagram { get; set; } = "dudapelaslentes";
    public string? WhatsApp { get; set; }
    public string MensagemWhatsApp { get; set; } =
        "Olá, Duda! Vim pelo site e gostaria de saber mais sobre os seus ensaios.";
    public string? Email { get; set; }
    public string? Cidade { get; set; }
    public string? RegiaoAtendida { get; set; }
    public int DesdeAno { get; set; } = 2017;

    public string? Logo { get; set; }
    public string? Favicon { get; set; }
    public string? ImagemSocial { get; set; }

    public string SeoTitle { get; set; } = "Duda Pelas Lentes | Fotografia";
    public string SeoDescription { get; set; } =
        "Eternizando momentos desde 2017. Retratos para diferentes fases da vida.";

    public string TextoRodape { get; set; } =
        "Desde 2017, eternizando momentos e contando histórias através da fotografia.";

    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;
}
