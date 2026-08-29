using DudaPelasLentes.Api.Configuration;
using Microsoft.Extensions.Options;

namespace DudaPelasLentes.Api.Storage;

/// <summary>Armazenamento em disco local para desenvolvimento (storage/uploads).</summary>
public sealed class LocalFileStorage : IFileStorage
{
    private readonly string _rootPath;
    private readonly string _publicBasePath;

    public LocalFileStorage(IOptions<StorageOptions> options, IHostEnvironment env)
    {
        var opts = options.Value;
        _rootPath = Path.IsPathRooted(opts.LocalRootPath)
            ? opts.LocalRootPath
            : Path.Combine(env.ContentRootPath, opts.LocalRootPath);
        _publicBasePath = "/" + opts.PublicBasePath.Trim('/');
        Directory.CreateDirectory(_rootPath);
    }

    /// <summary>Diretório físico raiz — usado pelo middleware de arquivos estáticos.</summary>
    public string RootPath => _rootPath;

    public string RequestPath => _publicBasePath;

    public async Task<string> SaveAsync(string relativeKey, Stream content, string contentType, CancellationToken ct = default)
    {
        var fullPath = ResolveSafePath(relativeKey);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None);
        await content.CopyToAsync(fs, ct);

        return GetPublicUrl(relativeKey);
    }

    public Task DeleteAsync(string relativeKey, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(relativeKey))
            return Task.CompletedTask;

        // Aceita tanto a chave relativa quanto o path público persistido no banco.
        var key = relativeKey.StartsWith(_publicBasePath, StringComparison.OrdinalIgnoreCase)
            ? relativeKey[_publicBasePath.Length..].TrimStart('/')
            : relativeKey;

        var fullPath = ResolveSafePath(key);
        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }

    public string GetPublicUrl(string relativeKey)
        => $"{_publicBasePath}/{relativeKey.Replace('\\', '/').TrimStart('/')}";

    /// <summary>Resolve o caminho absoluto garantindo que fique dentro da raiz (anti path traversal).</summary>
    private string ResolveSafePath(string relativeKey)
    {
        if (string.IsNullOrWhiteSpace(relativeKey))
            throw new ArgumentException("Chave de arquivo inválida.", nameof(relativeKey));

        var normalized = relativeKey.Replace('\\', '/').TrimStart('/');
        if (normalized.Split('/').Any(seg => seg is "." or ".."))
            throw new InvalidOperationException("Caminho de arquivo não permitido.");

        var candidate = Path.GetFullPath(Path.Combine(_rootPath, normalized));
        var rootWithSep = _rootPath.EndsWith(Path.DirectorySeparatorChar)
            ? _rootPath
            : _rootPath + Path.DirectorySeparatorChar;

        if (!candidate.StartsWith(rootWithSep, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Caminho de arquivo fora do diretório permitido.");

        return candidate;
    }
}
