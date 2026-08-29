using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using DudaPelasLentes.Api.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[Route("api/admin/categorias")]
public sealed class AdminCategoriasController(
    DudaPelasLentesDbContext db,
    ISlugService slugs,
    IImageUploadService uploads,
    IFileStorage storage) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoriaAdminDto>>> Listar(CancellationToken ct)
        => Ok(await db.Categorias.AsNoTracking()
            .OrderBy(c => c.Ordem).ThenBy(c => c.Nome)
            .Select(c => new CategoriaAdminDto(
                c.Id, c.Nome, c.Slug, c.Descricao, c.ImagemCapa, c.Icone, c.Ativa, c.Ordem,
                c.Ensaios.Count))
            .ToListAsync(ct));

    [HttpPost]
    public async Task<ActionResult<CategoriaAdminDto>> Criar([FromBody] CategoriaUpsertDto dto, CancellationToken ct)
    {
        var slug = await slugs.GenerateUniqueAsync(dto.Nome,
            s => db.Categorias.AnyAsync(c => c.Slug == s, ct));

        var cat = new CategoriaPortfolio
        {
            Nome = dto.Nome.Trim(),
            Slug = slug,
            Descricao = Trim(dto.Descricao),
            Icone = Trim(dto.Icone) ?? "camera",
            Ativa = dto.Ativa,
            Ordem = dto.Ordem
        };
        db.Categorias.Add(cat);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Listar), new { id = cat.Id }, ToDto(cat, 0));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoriaAdminDto>> Atualizar(Guid id, [FromBody] CategoriaUpsertDto dto, CancellationToken ct)
    {
        var cat = await db.Categorias.FindAsync([id], ct);
        if (cat is null) return NotFound();

        if (!string.Equals(cat.Nome, dto.Nome.Trim(), StringComparison.Ordinal))
            cat.Slug = await slugs.GenerateUniqueAsync(dto.Nome,
                s => db.Categorias.AnyAsync(c => c.Slug == s && c.Id != id, ct));

        cat.Nome = dto.Nome.Trim();
        cat.Descricao = Trim(dto.Descricao);
        cat.Icone = Trim(dto.Icone) ?? cat.Icone;
        cat.Ativa = dto.Ativa;
        cat.Ordem = dto.Ordem;
        cat.AtualizadoEm = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        var total = await db.Ensaios.CountAsync(e => e.CategoriaId == id, ct);
        return Ok(ToDto(cat, total));
    }

    [HttpPost("{id:guid}/imagem")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult<CategoriaAdminDto>> EnviarImagem(Guid id, IFormFile arquivo, CancellationToken ct)
    {
        var cat = await db.Categorias.FindAsync([id], ct);
        if (cat is null) return NotFound();
        if (arquivo is null || arquivo.Length == 0) return ValidationProblem("Selecione uma imagem.");

        await using var stream = arquivo.OpenReadStream();
        var result = await uploads.ProcessAsync(stream, arquivo.FileName, arquivo.ContentType, "categorias", ct);

        if (cat.ImagemCapa is not null) await storage.DeleteAsync(cat.ImagemCapa, ct);
        cat.ImagemCapa = result.Large;
        cat.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var total = await db.Ensaios.CountAsync(e => e.CategoriaId == id, ct);
        return Ok(ToDto(cat, total));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        var cat = await db.Categorias.FindAsync([id], ct);
        if (cat is null) return NotFound();

        if (await db.Ensaios.AnyAsync(e => e.CategoriaId == id, ct))
        {
            // Não apaga com ensaios vinculados — apenas desativa.
            cat.Ativa = false;
            cat.AtualizadoEm = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
            return Ok(new { mensagem = "Categoria com ensaios vinculados foi desativada em vez de excluída." });
        }

        if (cat.ImagemCapa is not null) await storage.DeleteAsync(cat.ImagemCapa, ct);
        db.Categorias.Remove(cat);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("ordenar")]
    public async Task<IActionResult> Ordenar([FromBody] ReordenarDto dto, CancellationToken ct)
    {
        var cats = await db.Categorias.Where(c => dto.Ids.Contains(c.Id)).ToListAsync(ct);
        for (var i = 0; i < dto.Ids.Count; i++)
        {
            var c = cats.FirstOrDefault(x => x.Id == dto.Ids[i]);
            if (c is not null) c.Ordem = i;
        }
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? Trim(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static CategoriaAdminDto ToDto(CategoriaPortfolio c, int total) => new(
        c.Id, c.Nome, c.Slug, c.Descricao, c.ImagemCapa, c.Icone, c.Ativa, c.Ordem, total);
}
