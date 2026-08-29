using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using DudaPelasLentes.Api.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

/// <summary>Gestão manual das imagens da grade "Me acompanhe no Instagram" (sem API oficial).</summary>
[Route("api/admin/instagram")]
public sealed class AdminInstagramController(
    DudaPelasLentesDbContext db,
    IImageUploadService uploads,
    IFileStorage storage) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InstagramFotoAdminDto>>> Listar(CancellationToken ct)
        => Ok(await db.InstagramFotos.AsNoTracking()
            .OrderBy(i => i.Ordem)
            .Select(i => new InstagramFotoAdminDto(i.Id, i.ArquivoMedium, i.ArquivoThumb, i.Alt, i.LinkExterno, i.Ativo, i.Ordem))
            .ToListAsync(ct));

    [HttpPost]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<InstagramFotoAdminDto>> Adicionar(IFormFile arquivo, [FromForm] string? alt, [FromForm] string? linkExterno, CancellationToken ct)
    {
        if (arquivo is null || arquivo.Length == 0) return ValidationProblem("Selecione uma imagem.");

        await using var stream = arquivo.OpenReadStream();
        var r = await uploads.ProcessAsync(stream, arquivo.FileName, arquivo.ContentType, "instagram", ct);

        var ordem = (await db.InstagramFotos.Select(i => (int?)i.Ordem).MaxAsync(ct) ?? -1) + 1;
        var foto = new InstagramFoto
        {
            ArquivoMedium = r.Medium,
            ArquivoThumb = r.Thumb,
            Alt = string.IsNullOrWhiteSpace(alt) ? null : alt.Trim(),
            LinkExterno = string.IsNullOrWhiteSpace(linkExterno) ? null : linkExterno.Trim(),
            Ativo = true,
            Ordem = ordem
        };
        db.InstagramFotos.Add(foto);
        await db.SaveChangesAsync(ct);
        return Ok(new InstagramFotoAdminDto(foto.Id, foto.ArquivoMedium, foto.ArquivoThumb, foto.Alt, foto.LinkExterno, foto.Ativo, foto.Ordem));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, [FromBody] InstagramFotoUpdateDto dto, CancellationToken ct)
    {
        var foto = await db.InstagramFotos.FindAsync([id], ct);
        if (foto is null) return NotFound();
        foto.Alt = string.IsNullOrWhiteSpace(dto.Alt) ? null : dto.Alt.Trim();
        foto.LinkExterno = string.IsNullOrWhiteSpace(dto.LinkExterno) ? null : dto.LinkExterno.Trim();
        foto.Ativo = dto.Ativo;
        foto.Ordem = dto.Ordem;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        var foto = await db.InstagramFotos.FindAsync([id], ct);
        if (foto is null) return NotFound();
        await storage.DeleteAsync(foto.ArquivoMedium, ct);
        await storage.DeleteAsync(foto.ArquivoThumb, ct);
        db.InstagramFotos.Remove(foto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("ordenar")]
    public async Task<IActionResult> Ordenar([FromBody] ReordenarDto dto, CancellationToken ct)
    {
        var itens = await db.InstagramFotos.Where(i => dto.Ids.Contains(i.Id)).ToListAsync(ct);
        for (var i = 0; i < dto.Ids.Count; i++)
        {
            var f = itens.FirstOrDefault(x => x.Id == dto.Ids[i]);
            if (f is not null) f.Ordem = i;
        }
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
