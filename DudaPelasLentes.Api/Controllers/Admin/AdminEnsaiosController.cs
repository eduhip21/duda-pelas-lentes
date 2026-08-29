using System.Globalization;
using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using DudaPelasLentes.Api.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[Route("api/admin/ensaios")]
public sealed class AdminEnsaiosController(
    DudaPelasLentesDbContext db,
    ISlugService slugs,
    IImageUploadService uploads,
    IFileStorage storage) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EnsaioAdminDto>>> Listar([FromQuery] Guid? categoriaId, CancellationToken ct)
    {
        var query = db.Ensaios.AsNoTracking().Include(e => e.Categoria).AsQueryable();
        if (categoriaId is { } cid) query = query.Where(e => e.CategoriaId == cid);

        return Ok(await query
            .OrderBy(e => e.Ordem).ThenByDescending(e => e.AtualizadoEm)
            .Select(e => ToDto(e, e.Fotos.Count))
            .ToListAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EnsaioAdminDto>> Obter(Guid id, CancellationToken ct)
    {
        var e = await db.Ensaios.AsNoTracking().Include(x => x.Categoria)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return e is null ? NotFound() : Ok(ToDto(e, await db.Fotos.CountAsync(f => f.EnsaioId == id, ct)));
    }

    [HttpPost]
    public async Task<ActionResult<EnsaioAdminDto>> Criar([FromBody] EnsaioUpsertDto dto, CancellationToken ct)
    {
        if (!await db.Categorias.AnyAsync(c => c.Id == dto.CategoriaId, ct))
            return ValidationProblem("Categoria inválida.");

        var ensaio = new Ensaio
        {
            Titulo = dto.Titulo.Trim(),
            Slug = await slugs.GenerateUniqueAsync(dto.Titulo, s => db.Ensaios.AnyAsync(e => e.Slug == s, ct)),
            Descricao = Trim(dto.Descricao),
            CategoriaId = dto.CategoriaId,
            Local = Trim(dto.Local),
            DataEnsaio = ParseDate(dto.DataEnsaio),
            Publicado = dto.Publicado,
            Destaque = dto.Destaque,
            Ordem = dto.Ordem
        };
        db.Ensaios.Add(ensaio);
        await db.SaveChangesAsync(ct);

        await db.Entry(ensaio).Reference(e => e.Categoria).LoadAsync(ct);
        return CreatedAtAction(nameof(Obter), new { id = ensaio.Id }, ToDto(ensaio, 0));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EnsaioAdminDto>> Atualizar(Guid id, [FromBody] EnsaioUpsertDto dto, CancellationToken ct)
    {
        var ensaio = await db.Ensaios.Include(e => e.Categoria).FirstOrDefaultAsync(e => e.Id == id, ct);
        if (ensaio is null) return NotFound();
        if (!await db.Categorias.AnyAsync(c => c.Id == dto.CategoriaId, ct))
            return ValidationProblem("Categoria inválida.");

        if (!string.Equals(ensaio.Titulo, dto.Titulo.Trim(), StringComparison.Ordinal))
            ensaio.Slug = await slugs.GenerateUniqueAsync(dto.Titulo,
                s => db.Ensaios.AnyAsync(e => e.Slug == s && e.Id != id, ct));

        ensaio.Titulo = dto.Titulo.Trim();
        ensaio.Descricao = Trim(dto.Descricao);
        ensaio.CategoriaId = dto.CategoriaId;
        ensaio.Local = Trim(dto.Local);
        ensaio.DataEnsaio = ParseDate(dto.DataEnsaio);
        ensaio.Publicado = dto.Publicado;
        ensaio.Destaque = dto.Destaque;
        ensaio.Ordem = dto.Ordem;
        ensaio.AtualizadoEm = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        await db.Entry(ensaio).Reference(e => e.Categoria).LoadAsync(ct);
        return Ok(ToDto(ensaio, await db.Fotos.CountAsync(f => f.EnsaioId == id, ct)));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        var ensaio = await db.Ensaios.Include(e => e.Fotos).FirstOrDefaultAsync(e => e.Id == id, ct);
        if (ensaio is null) return NotFound();

        foreach (var f in ensaio.Fotos)
            await DeleteFotoArquivosAsync(f, ct);
        if (ensaio.FotoCapa is not null) await storage.DeleteAsync(ensaio.FotoCapa, ct);

        db.Ensaios.Remove(ensaio);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ---------- Fotos do ensaio ----------

    [HttpGet("{id:guid}/fotos")]
    public async Task<ActionResult<IReadOnlyList<FotoAdminDto>>> ListarFotos(Guid id, CancellationToken ct)
    {
        if (!await db.Ensaios.AnyAsync(e => e.Id == id, ct)) return NotFound();
        return Ok(await db.Fotos.AsNoTracking()
            .Where(f => f.EnsaioId == id)
            .OrderBy(f => f.Ordem)
            .Select(f => new FotoAdminDto(f.Id, f.ArquivoOriginal, f.ArquivoLarge, f.ArquivoMedium,
                f.ArquivoThumb, f.Alt, f.Ordem, f.Destaque))
            .ToListAsync(ct));
    }

    [HttpPost("{id:guid}/fotos")]
    [RequestSizeLimit(120 * 1024 * 1024)]
    public async Task<ActionResult<IReadOnlyList<FotoAdminDto>>> EnviarFotos(Guid id, [FromForm] List<IFormFile> arquivos, CancellationToken ct)
    {
        var ensaio = await db.Ensaios.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (ensaio is null) return NotFound();
        if (arquivos is null || arquivos.Count == 0) return ValidationProblem("Selecione ao menos uma foto.");

        var ordemBase = await db.Fotos.Where(f => f.EnsaioId == id).Select(f => (int?)f.Ordem).MaxAsync(ct) ?? -1;
        var criadas = new List<Foto>();

        foreach (var arquivo in arquivos)
        {
            if (arquivo.Length == 0) continue;
            await using var stream = arquivo.OpenReadStream();
            var r = await uploads.ProcessAsync(stream, arquivo.FileName, arquivo.ContentType, $"ensaios/{ensaio.Slug}", ct);

            var foto = new Foto
            {
                EnsaioId = id,
                ArquivoOriginal = r.Original,
                ArquivoLarge = r.Large,
                ArquivoMedium = r.Medium,
                ArquivoThumb = r.Thumb,
                Largura = r.Width,
                Altura = r.Height,
                Ordem = ++ordemBase
            };
            db.Fotos.Add(foto);
            criadas.Add(foto);
        }

        // Define capa automaticamente se ainda não houver.
        if (ensaio.FotoCapa is null && criadas.Count > 0)
            ensaio.FotoCapa = criadas[0].ArquivoLarge;
        ensaio.AtualizadoEm = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(ct);
        return Ok(criadas.Select(f => new FotoAdminDto(f.Id, f.ArquivoOriginal, f.ArquivoLarge,
            f.ArquivoMedium, f.ArquivoThumb, f.Alt, f.Ordem, f.Destaque)).ToList());
    }

    [HttpPut("{id:guid}/fotos/{fotoId:guid}")]
    public async Task<IActionResult> AtualizarFoto(Guid id, Guid fotoId, [FromBody] FotoUpdateDto dto, CancellationToken ct)
    {
        var foto = await db.Fotos.FirstOrDefaultAsync(f => f.Id == fotoId && f.EnsaioId == id, ct);
        if (foto is null) return NotFound();
        foto.Alt = string.IsNullOrWhiteSpace(dto.Alt) ? null : dto.Alt.Trim();
        foto.Destaque = dto.Destaque;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/fotos/ordenar")]
    public async Task<IActionResult> OrdenarFotos(Guid id, [FromBody] ReordenarDto dto, CancellationToken ct)
    {
        var fotos = await db.Fotos.Where(f => f.EnsaioId == id && dto.Ids.Contains(f.Id)).ToListAsync(ct);
        for (var i = 0; i < dto.Ids.Count; i++)
        {
            var f = fotos.FirstOrDefault(x => x.Id == dto.Ids[i]);
            if (f is not null) f.Ordem = i;
        }
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("{id:guid}/capa/{fotoId:guid}")]
    public async Task<IActionResult> DefinirCapa(Guid id, Guid fotoId, CancellationToken ct)
    {
        var ensaio = await db.Ensaios.FirstOrDefaultAsync(e => e.Id == id, ct);
        var foto = await db.Fotos.FirstOrDefaultAsync(f => f.Id == fotoId && f.EnsaioId == id, ct);
        if (ensaio is null || foto is null) return NotFound();
        ensaio.FotoCapa = foto.ArquivoLarge;
        ensaio.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/fotos/{fotoId:guid}")]
    public async Task<IActionResult> ExcluirFoto(Guid id, Guid fotoId, CancellationToken ct)
    {
        var foto = await db.Fotos.FirstOrDefaultAsync(f => f.Id == fotoId && f.EnsaioId == id, ct);
        if (foto is null) return NotFound();

        await DeleteFotoArquivosAsync(foto, ct);
        db.Fotos.Remove(foto);

        var ensaio = await db.Ensaios.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (ensaio?.FotoCapa == foto.ArquivoLarge)
            ensaio.FotoCapa = await db.Fotos
                .Where(f => f.EnsaioId == id && f.Id != fotoId)
                .OrderBy(f => f.Ordem).Select(f => f.ArquivoLarge).FirstOrDefaultAsync(ct);

        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ---------- helpers ----------

    private async Task DeleteFotoArquivosAsync(Foto f, CancellationToken ct)
    {
        await storage.DeleteAsync(f.ArquivoOriginal, ct);
        await storage.DeleteAsync(f.ArquivoLarge, ct);
        await storage.DeleteAsync(f.ArquivoMedium, ct);
        await storage.DeleteAsync(f.ArquivoThumb, ct);
    }

    private static string? Trim(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static DateOnly? ParseDate(string? s)
        => DateOnly.TryParse(s, CultureInfo.InvariantCulture, out var d) ? d : null;

    private static EnsaioAdminDto ToDto(Ensaio e, int totalFotos) => new(
        e.Id, e.Titulo, e.Slug, e.Descricao, e.CategoriaId, e.Categoria?.Nome ?? string.Empty,
        e.FotoCapa, e.DataEnsaio?.ToString("yyyy-MM-dd"), e.Local, e.Publicado, e.Destaque, e.Ordem,
        totalFotos, e.AtualizadoEm);
}
