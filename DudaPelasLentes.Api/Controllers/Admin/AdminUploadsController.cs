using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DudaPelasLentes.Api.Controllers.Admin;

/// <summary>
/// Upload avulso de imagens (Hero, CTA, Sobre, Logo...). Devolve os paths das variantes;
/// o admin salva o path escolhido no conteúdo/configuração correspondente.
/// </summary>
[Route("api/admin/uploads")]
public sealed class AdminUploadsController(IImageUploadService uploads) : AdminControllerBase
{
    private static readonly HashSet<string> PastasPermitidas =
        ["hero", "cta", "sobre", "marca", "diversos"];

    [HttpPost("{pasta}")]
    [EnableRateLimiting("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<UploadResultDto>> Enviar(string pasta, IFormFile arquivo, CancellationToken ct)
    {
        if (!PastasPermitidas.Contains(pasta.ToLowerInvariant()))
            return ValidationProblem("Destino de upload inválido.");
        if (arquivo is null || arquivo.Length == 0)
            return ValidationProblem("Selecione uma imagem.");

        await using var stream = arquivo.OpenReadStream();
        var r = await uploads.ProcessAsync(stream, arquivo.FileName, arquivo.ContentType, pasta.ToLowerInvariant(), ct);

        return Ok(new UploadResultDto(r.Original, r.Large, r.Medium, r.Thumb, r.Width, r.Height));
    }
}
