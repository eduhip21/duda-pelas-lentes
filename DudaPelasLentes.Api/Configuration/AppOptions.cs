namespace DudaPelasLentes.Api.Configuration;

/// <summary>Configuração do JWT. Valores reais vêm de User Secrets / variáveis de ambiente.</summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "duda-pelas-lentes";
    public string Audience { get; set; } = "duda-pelas-lentes";
    public int ExpiresMinutes { get; set; } = 480;
}

/// <summary>Origens liberadas no CORS. Em Development usa o default do Vite.</summary>
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    public string[] AllowedOrigins { get; set; } = ["http://localhost:5173"];
}

/// <summary>Configuração de storage de arquivos (implementação local no momento).</summary>
public sealed class StorageOptions
{
    public const string SectionName = "Storage";

    /// <summary>Provider ativo: "Local" (futuramente "R2", "S3", "AzureBlob").</summary>
    public string Provider { get; set; } = "Local";

    /// <summary>Diretório raiz do storage local (relativo ao ContentRoot quando não absoluto).</summary>
    public string LocalRootPath { get; set; } = "storage/uploads";

    /// <summary>Caminho público sob o qual os arquivos são servidos.</summary>
    public string PublicBasePath { get; set; } = "/media";
}

/// <summary>Parâmetros de validação e processamento de imagens.</summary>
public sealed class ImageOptions
{
    public const string SectionName = "Images";

    public long MaxUploadBytes { get; set; } = 15 * 1024 * 1024; // 15 MB
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp"];
    public string[] AllowedMimeTypes { get; set; } = ["image/jpeg", "image/png", "image/webp"];

    public ImageVariant Large { get; set; } = new() { MaxWidth = 2000, MaxHeight = 2000, Quality = 82 };
    public ImageVariant Medium { get; set; } = new() { MaxWidth = 1200, MaxHeight = 1200, Quality = 80 };
    public ImageVariant Thumb { get; set; } = new() { MaxWidth = 500, MaxHeight = 500, Quality = 78 };

    public sealed class ImageVariant
    {
        public int MaxWidth { get; set; }
        public int MaxHeight { get; set; }
        public int Quality { get; set; }
    }
}

/// <summary>Admin inicial criado apenas em Development quando não há nenhum administrador.</summary>
public sealed class BootstrapAdminOptions
{
    public const string SectionName = "BootstrapAdmin";

    public string? Email { get; set; }
    public string? Password { get; set; }
    public string Nome { get; set; } = "Duda";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);
}
