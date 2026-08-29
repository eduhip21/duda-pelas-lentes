namespace DudaPelasLentes.Api.Storage;

/// <summary>
/// Abstração de armazenamento de arquivos. A implementação inicial é local;
/// a arquitetura permite trocar por Cloudflare R2 / S3 / Azure Blob futuramente.
/// </summary>
public interface IFileStorage
{
    /// <summary>Salva o conteúdo sob a chave relativa informada e devolve o path público.</summary>
    Task<string> SaveAsync(string relativeKey, Stream content, string contentType, CancellationToken ct = default);

    /// <summary>Remove o arquivo pela chave relativa. Não lança se o arquivo não existir.</summary>
    Task DeleteAsync(string relativeKey, CancellationToken ct = default);

    /// <summary>Converte uma chave relativa em URL/path público servível.</summary>
    string GetPublicUrl(string relativeKey);
}
