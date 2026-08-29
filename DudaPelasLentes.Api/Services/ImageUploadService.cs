using DudaPelasLentes.Api.Configuration;
using DudaPelasLentes.Api.Storage;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace DudaPelasLentes.Api.Services;

/// <summary>Resultado de um upload processado: paths públicos das variantes geradas.</summary>
public sealed record ProcessedImage(
    string Original,
    string Large,
    string Medium,
    string Thumb,
    int Width,
    int Height);

public interface IImageUploadService
{
    /// <summary>Valida e processa a imagem, gerando as variantes. Lança <see cref="ImageValidationException"/> em entradas inválidas.</summary>
    Task<ProcessedImage> ProcessAsync(Stream input, string originalFileName, string contentType, string folder, CancellationToken ct = default);
}

public sealed class ImageValidationException(string message) : Exception(message);

public sealed class ImageUploadService(
    IFileStorage storage,
    IOptions<ImageOptions> imageOptions) : IImageUploadService
{
    private readonly ImageOptions _opts = imageOptions.Value;

    // Assinaturas (magic bytes) aceitas.
    private static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    public async Task<ProcessedImage> ProcessAsync(
        Stream input, string originalFileName, string contentType, string folder, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (!_opts.AllowedExtensions.Contains(ext))
            throw new ImageValidationException("Formato de arquivo não permitido. Envie JPG, PNG ou WEBP.");

        if (!_opts.AllowedMimeTypes.Contains(contentType.ToLowerInvariant()))
            throw new ImageValidationException("Tipo de conteúdo não permitido.");

        // Buffer em memória para permitir múltiplas leituras e checagem de tamanho real.
        using var buffer = new MemoryStream();
        await input.CopyToAsync(buffer, ct);
        if (buffer.Length == 0)
            throw new ImageValidationException("Arquivo vazio.");
        if (buffer.Length > _opts.MaxUploadBytes)
            throw new ImageValidationException($"Arquivo acima do limite de {_opts.MaxUploadBytes / (1024 * 1024)} MB.");

        buffer.Position = 0;
        if (!await HasValidSignatureAsync(buffer, ct))
            throw new ImageValidationException("O conteúdo do arquivo não corresponde a uma imagem válida.");

        buffer.Position = 0;

        Image image;
        try
        {
            image = await Image.LoadAsync(buffer, ct);
        }
        catch (Exception)
        {
            throw new ImageValidationException("Não foi possível ler a imagem enviada.");
        }

        using (image)
        {
            // Remove metadados EXIF/GPS/ICC preservando orientação já aplicada.
            image.Mutate(x => x.AutoOrient());
            image.Metadata.ExifProfile = null;
            image.Metadata.XmpProfile = null;
            image.Metadata.IptcProfile = null;

            var width = image.Width;
            var height = image.Height;

            var guid = Guid.NewGuid().ToString("n");
            var safeFolder = SanitizeFolder(folder);

            var original = await SaveVariantAsync(image, safeFolder, $"{guid}_orig", null, 92, ct);
            var large = await SaveVariantAsync(image, safeFolder, $"{guid}_lg", _opts.Large, _opts.Large.Quality, ct);
            var medium = await SaveVariantAsync(image, safeFolder, $"{guid}_md", _opts.Medium, _opts.Medium.Quality, ct);
            var thumb = await SaveVariantAsync(image, safeFolder, $"{guid}_sm", _opts.Thumb, _opts.Thumb.Quality, ct);

            return new ProcessedImage(original, large, medium, thumb, width, height);
        }
    }

    private async Task<string> SaveVariantAsync(
        Image source, string folder, string name, ImageOptions.ImageVariant? variant, int quality, CancellationToken ct)
    {
        using var clone = source.Clone(ctx =>
        {
            if (variant is not null && (source.Width > variant.MaxWidth || source.Height > variant.MaxHeight))
            {
                ctx.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(variant.MaxWidth, variant.MaxHeight)
                });
            }
        });

        var encoder = new JpegEncoder { Quality = quality };
        var key = $"{folder}/{name}.jpg";

        using var outStream = new MemoryStream();
        await clone.SaveAsync(outStream, encoder, ct);
        outStream.Position = 0;

        return await storage.SaveAsync(key, outStream, "image/jpeg", ct);
    }

    private static async Task<bool> HasValidSignatureAsync(Stream stream, CancellationToken ct)
    {
        var head = new byte[12];
        var read = await stream.ReadAsync(head.AsMemory(0, 12), ct);
        if (read < 4) return false;

        if (head.AsSpan(0, 3).SequenceEqual(Jpeg)) return true;
        if (head.AsSpan(0, 8).SequenceEqual(Png)) return true;

        // WEBP: "RIFF"...."WEBP"
        var isRiff = head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F';
        var isWebp = read >= 12 && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P';
        return isRiff && isWebp;
    }

    private static string SanitizeFolder(string folder)
    {
        var clean = new string(folder.Where(c => char.IsLetterOrDigit(c) || c is '-' or '_' or '/').ToArray())
            .Trim('/');
        return string.IsNullOrEmpty(clean) ? "misc" : clean;
    }
}
