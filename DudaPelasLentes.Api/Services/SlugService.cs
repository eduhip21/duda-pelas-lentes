using System.Globalization;
using System.Text;

namespace DudaPelasLentes.Api.Services;

public interface ISlugService
{
    string Generate(string input);
    Task<string> GenerateUniqueAsync(string input, Func<string, Task<bool>> existsAsync);
}

/// <summary>Gera slugs a partir de texto livre. A fotógrafa nunca digita slug manualmente.</summary>
public sealed class SlugService : ISlugService
{
    public string Generate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return Guid.NewGuid().ToString("n")[..8];

        var normalized = input.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);

        foreach (var ch in normalized)
        {
            var cat = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (cat == UnicodeCategory.NonSpacingMark)
                continue;

            if (char.IsLetterOrDigit(ch) && ch < 128)
                sb.Append(ch);
            else if (ch is ' ' or '-' or '_' or '/')
                sb.Append('-');
        }

        var slug = sb.ToString();
        while (slug.Contains("--"))
            slug = slug.Replace("--", "-");
        slug = slug.Trim('-');

        return string.IsNullOrEmpty(slug) ? Guid.NewGuid().ToString("n")[..8] : slug;
    }

    public async Task<string> GenerateUniqueAsync(string input, Func<string, Task<bool>> existsAsync)
    {
        var baseSlug = Generate(input);
        var candidate = baseSlug;
        var suffix = 2;

        while (await existsAsync(candidate))
            candidate = $"{baseSlug}-{suffix++}";

        return candidate;
    }
}
