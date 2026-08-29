using System.Globalization;
using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using DudaPelasLentes.Api.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[Route("api/admin/depoimentos")]
public sealed class AdminDepoimentosController(
    DudaPelasLentesDbContext db,
    IImageUploadService uploads,
    IFileStorage storage) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DepoimentoAdminDto>>> Listar(CancellationToken ct)
        => Ok(await db.Depoimentos.AsNoTracking()
            .OrderBy(d => d.Ordem).ThenByDescending(d => d.CriadoEm)
            .Select(d => ToDto(d)).ToListAsync(ct));

    [HttpPost]
    public async Task<ActionResult<DepoimentoAdminDto>> Criar([FromBody] DepoimentoUpsertDto dto, CancellationToken ct)
    {
        var d = new Depoimento
        {
            NomeCliente = dto.NomeCliente.Trim(),
            Texto = dto.Texto.Trim(),
            Data = ParseDate(dto.Data),
            Ativo = dto.Ativo,
            Destaque = dto.Destaque,
            Ordem = dto.Ordem
        };
        db.Depoimentos.Add(d);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Listar), new { id = d.Id }, ToDto(d));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DepoimentoAdminDto>> Atualizar(Guid id, [FromBody] DepoimentoUpsertDto dto, CancellationToken ct)
    {
        var d = await db.Depoimentos.FindAsync([id], ct);
        if (d is null) return NotFound();
        d.NomeCliente = dto.NomeCliente.Trim();
        d.Texto = dto.Texto.Trim();
        d.Data = ParseDate(dto.Data);
        d.Ativo = dto.Ativo;
        d.Destaque = dto.Destaque;
        d.Ordem = dto.Ordem;
        d.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(d));
    }

    [HttpPost("{id:guid}/foto")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<DepoimentoAdminDto>> EnviarFoto(Guid id, IFormFile arquivo, CancellationToken ct)
    {
        var d = await db.Depoimentos.FindAsync([id], ct);
        if (d is null) return NotFound();
        if (arquivo is null || arquivo.Length == 0) return ValidationProblem("Selecione uma imagem.");

        await using var stream = arquivo.OpenReadStream();
        var r = await uploads.ProcessAsync(stream, arquivo.FileName, arquivo.ContentType, "depoimentos", ct);
        if (d.Foto is not null) await storage.DeleteAsync(d.Foto, ct);
        d.Foto = r.Thumb;
        d.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(d));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        var d = await db.Depoimentos.FindAsync([id], ct);
        if (d is null) return NotFound();
        if (d.Foto is not null) await storage.DeleteAsync(d.Foto, ct);
        db.Depoimentos.Remove(d);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("ordenar")]
    public async Task<IActionResult> Ordenar([FromBody] ReordenarDto dto, CancellationToken ct)
    {
        var itens = await db.Depoimentos.Where(d => dto.Ids.Contains(d.Id)).ToListAsync(ct);
        for (var i = 0; i < dto.Ids.Count; i++)
        {
            var d = itens.FirstOrDefault(x => x.Id == dto.Ids[i]);
            if (d is not null) d.Ordem = i;
        }
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static DateOnly? ParseDate(string? s)
        => DateOnly.TryParse(s, CultureInfo.InvariantCulture, out var d) ? d : null;

    private static DepoimentoAdminDto ToDto(Depoimento d) => new(
        d.Id, d.NomeCliente, d.Texto, d.Foto, d.Data?.ToString("yyyy-MM-dd"), d.Ativo, d.Destaque, d.Ordem);
}
