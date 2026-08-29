using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[Route("api/admin/dashboard")]
public sealed class AdminDashboardController(DudaPelasLentesDbContext db) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get(CancellationToken ct) => Ok(new DashboardDto(
        EnsaiosPublicados: await db.Ensaios.CountAsync(e => e.Publicado, ct),
        TotalFotografias: await db.Fotos.CountAsync(ct),
        Categorias: await db.Categorias.CountAsync(c => c.Ativa, ct),
        DepoimentosAtivos: await db.Depoimentos.CountAsync(d => d.Ativo, ct),
        NovosContatos: await db.ContatoLeads.CountAsync(c => c.Status == ContatoLeadStatus.Novo, ct)));
}
