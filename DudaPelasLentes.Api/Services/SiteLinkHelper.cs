using System.Text.RegularExpressions;

namespace DudaPelasLentes.Api.Services;

/// <summary>Gera com segurança links externos (wa.me, instagram) a partir da configuração.</summary>
public static partial class SiteLinkHelper
{
    [GeneratedRegex(@"\D")]
    private static partial Regex NonDigits();

    /// <summary>Monta o link wa.me com a mensagem inicial. Retorna null se não houver número válido.</summary>
    public static string? BuildWhatsAppUrl(string? rawNumber, string? mensagem)
    {
        if (string.IsNullOrWhiteSpace(rawNumber))
            return null;

        var digits = NonDigits().Replace(rawNumber, string.Empty);
        if (digits.Length is < 10 or > 15)
            return null;

        var url = $"https://wa.me/{digits}";
        if (!string.IsNullOrWhiteSpace(mensagem))
            url += $"?text={Uri.EscapeDataString(mensagem)}";

        return url;
    }

    public static string? BuildInstagramUrl(string? handle)
    {
        if (string.IsNullOrWhiteSpace(handle))
            return null;

        var clean = handle.Trim().TrimStart('@');
        clean = new string(clean.Where(c => char.IsLetterOrDigit(c) || c is '.' or '_').ToArray());
        return string.IsNullOrEmpty(clean) ? null : $"https://instagram.com/{clean}";
    }
}
