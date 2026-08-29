using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using DudaPelasLentes.Api.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[Route("api/admin/servicos")]
public sealed class AdminServicosController(
    DudaPelasLentesDbContext db,
    ISlugService slugs,
    IImageUploadService uploads,
    IFileStorage storage) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServicoAdminDto>>> Listar(CancellationToken ct)
        => Ok(await db.Servicos.AsNoTracking()
            .OrderBy(s => s.Ordem).ThenBy(s => s.Titulo)
            .Select(s => ToDto(s)).ToListAsync(ct));

    [HttpPost]
    public async Task<ActionResult<ServicoAdminDto>> Criar([FromBody] ServicoUpsertDto dto, CancellationToken ct)
    {
        var s = new Servico
        {
            Titulo = dto.Titulo.Trim(),
            Slug = await slugs.GenerateUniqueAsync(dto.Titulo, x => db.Servicos.AnyAsync(v => v.Slug == x, ct)),
            DescricaoCurta = Trim(dto.DescricaoCurta),
            Descricao = Trim(dto.Descricao),
            Ativo = dto.Ativo,
            Ordem = dto.Ordem
        };
        db.Servicos.Add(s);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Listar), new { id = s.Id }, ToDto(s));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ServicoAdminDto>> Atualizar(Guid id, [FromBody] ServicoUpsertDto dto, CancellationToken ct)
    {
        var s = await db.Servicos.FindAsync([id], ct);
        if (s is null) return NotFound();

        if (!string.Equals(s.Titulo, dto.Titulo.Trim(), StringComparison.Ordinal))
            s.Slug = await slugs.GenerateUniqueAsync(dto.Titulo, x => db.Servicos.AnyAsync(v => v.Slug == x && v.Id != id, ct));

        s.Titulo = dto.Titulo.Trim();
        s.DescricaoCurta = Trim(dto.DescricaoCurta);
        s.Descricao = Trim(dto.Descricao);
        s.Ativo = dto.Ativo;
        s.Ordem = dto.Ordem;
        s.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(s));
    }

    [HttpPost("{id:guid}/imagem")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<ServicoAdminDto>> EnviarImagem(Guid id, IFormFile arquivo, CancellationToken ct)
    {
        var s = await db.Servicos.FindAsync([id], ct);
        if (s is null) return NotFound();
        if (arquivo is null || arquivo.Length == 0) return ValidationProblem("Selecione uma imagem.");

        await using var stream = arquivo.OpenReadStream();
        var r = await uploads.ProcessAsync(stream, arquivo.FileName, arquivo.ContentType, "servicos", ct);
        if (s.ImagemCapa is not null) await storage.DeleteAsync(s.ImagemCapa, ct);
        s.ImagemCapa = r.Large;
        s.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(s));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        var s = await db.Servicos.FindAsync([id], ct);
        if (s is null) return NotFound();
        if (s.ImagemCapa is not null) await storage.DeleteAsync(s.ImagemCapa, ct);
        db.Servicos.Remove(s);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("ordenar")]
    public async Task<IActionResult> Ordenar([FromBody] ReordenarDto dto, CancellationToken ct)
    {
        var itens = await db.Servicos.Where(s => dto.Ids.Contains(s.Id)).ToListAsync(ct);
        for (var i = 0; i < dto.Ids.Count; i++)
        {
            var s = itens.FirstOrDefault(x => x.Id == dto.Ids[i]);
            if (s is not null) s.Ordem = i;
        }
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? Trim(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static ServicoAdminDto ToDto(Servico s) => new(
        s.Id, s.Titulo, s.Slug, s.DescricaoCurta, s.Descricao, s.ImagemCapa, s.Ativo, s.Ordem);
}
