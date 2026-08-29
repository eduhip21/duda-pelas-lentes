using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers;

[ApiController]
[Route("api/public/portfolio")]
[Produces("application/json")]
public sealed class PublicPortfolioController(DudaPelasLentesDbContext db) : ControllerBase
{
    [HttpGet]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<PortfolioListaDto>> GetLista([FromQuery] string? categoria, CancellationToken ct)
    {
        var categorias = await db.Categorias.AsNoTracking()
            .Where(c => c.Ativa)
            .OrderBy(c => c.Ordem).ThenBy(c => c.Nome)
            .Select(c => c.ToPublic())
            .ToListAsync(ct);

        var query = db.Ensaios.AsNoTracking()
            .Include(e => e.Categoria)
            .Where(e => e.Publicado);

        if (!string.IsNullOrWhiteSpace(categoria))
            query = query.Where(e => e.Categoria!.Slug == categoria);

        var ensaios = await query
            .OrderBy(e => e.Ordem).ThenByDescending(e => e.DataEnsaio)
            .Select(e => e.ToResumo())
            .ToListAsync(ct);

        return Ok(new PortfolioListaDto(categorias, ensaios));
    }

    [HttpGet("{slug}")]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<EnsaioDetalheDto>> GetPorSlug(string slug, CancellationToken ct)
    {
        var ensaio = await db.Ensaios.AsNoTracking()
            .Include(e => e.Categoria)
            .Include(e => e.Fotos)
            .FirstOrDefaultAsync(e => e.Slug == slug && e.Publicado, ct);

        return ensaio is null ? NotFound() : Ok(ensaio.ToDetalhe());
    }
}
