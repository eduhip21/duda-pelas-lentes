using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[Route("api/admin/contatos")]
public sealed class AdminContatosController(DudaPelasLentesDbContext db) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ContatoLeadDto>>> Listar([FromQuery] string? status, CancellationToken ct)
    {
        var query = db.ContatoLeads.AsNoTracking().AsQueryable();
        if (Enum.TryParse<ContatoLeadStatus>(status, ignoreCase: true, out var s))
            query = query.Where(c => c.Status == s);

        return Ok(await query
            .OrderByDescending(c => c.CriadoEm)
            .Select(c => ToDto(c))
            .ToListAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContatoLeadDto>> Obter(Guid id, CancellationToken ct)
    {
        var c = await db.ContatoLeads.FindAsync([id], ct);
        return c is null ? NotFound() : Ok(ToDto(c));
    }

    [HttpPut("{id:guid}/responder")]
    public async Task<IActionResult> MarcarRespondido(Guid id, CancellationToken ct)
        => await MudarStatus(id, ContatoLeadStatus.Respondido, ct);

    [HttpPut("{id:guid}/arquivar")]
    public async Task<IActionResult> Arquivar(Guid id, CancellationToken ct)
        => await MudarStatus(id, ContatoLeadStatus.Arquivado, ct);

    [HttpPut("{id:guid}/reabrir")]
    public async Task<IActionResult> Reabrir(Guid id, CancellationToken ct)
        => await MudarStatus(id, ContatoLeadStatus.Novo, ct);

    private async Task<IActionResult> MudarStatus(Guid id, ContatoLeadStatus status, CancellationToken ct)
    {
        var c = await db.ContatoLeads.FindAsync([id], ct);
        if (c is null) return NotFound();
        c.Status = status;
        c.RespondidoEm = status == ContatoLeadStatus.Respondido ? DateTimeOffset.UtcNow : c.RespondidoEm;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static ContatoLeadDto ToDto(ContatoLead c) => new(
        c.Id, c.Nome, c.Email, c.WhatsApp, c.TipoEnsaio, c.Mensagem,
        c.Status.ToString(), c.CriadoEm, c.RespondidoEm);
}
