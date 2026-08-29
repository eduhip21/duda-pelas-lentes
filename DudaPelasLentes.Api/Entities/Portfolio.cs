namespace DudaPelasLentes.Api.Entities;

/// <summary>Categoria do portfólio (Ensaios, Famílias, Gestantes, Casamentos, Eventos...).</summary>
public class CategoriaPortfolio
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Descricao { get; set; }

    /// <summary>Referência (path público) da imagem de capa da categoria. Nunca binário.</summary>
    public string? ImagemCapa { get; set; }

    /// <summary>Ícone discreto exibido no card (nome simbólico resolvido no front).</summary>
    public string? Icone { get; set; }

    public bool Ativa { get; set; } = true;
    public int Ordem { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Ensaio> Ensaios { get; set; } = [];
}

/// <summary>Conceito central do portfólio. Um ensaio agrupa várias fotografias.</summary>
public class Ensaio
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Titulo { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Descricao { get; set; }

    public Guid CategoriaId { get; set; }
    public CategoriaPortfolio? Categoria { get; set; }

    /// <summary>Path público da foto de capa.</summary>
    public string? FotoCapa { get; set; }

    public DateOnly? DataEnsaio { get; set; }
    public string? Local { get; set; }

    public bool Publicado { get; set; }
    public bool Destaque { get; set; }
    public int Ordem { get; set; }

    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset AtualizadoEm { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Foto> Fotos { get; set; } = [];
}

/// <summary>Fotografia de um ensaio. O banco guarda apenas referências e metadados.</summary>
public class Foto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid EnsaioId { get; set; }
    public Ensaio? Ensaio { get; set; }

    public string ArquivoOriginal { get; set; } = string.Empty;
    public string ArquivoLarge { get; set; } = string.Empty;
    public string ArquivoMedium { get; set; } = string.Empty;
    public string ArquivoThumb { get; set; } = string.Empty;

    public string? Alt { get; set; }
    public int Ordem { get; set; }
    public bool Destaque { get; set; }

    public int? Largura { get; set; }
    public int? Altura { get; set; }

    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
}
