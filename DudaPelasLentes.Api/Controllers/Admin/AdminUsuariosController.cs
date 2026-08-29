using System.Security.Claims;
using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

/// <summary>
/// Gestão de usuários administrativos. Exclusivo do perfil Master.
/// Admin autenticado que chamar estes endpoints recebe 403; sem autenticação, 401.
/// </summary>
[ApiController]
[Authorize(Policy = "Master")]
[Route("api/admin/usuarios")]
[Produces("application/json")]
public sealed class AdminUsuariosController(
    DudaPelasLentesDbContext db,
    IPasswordHasherService hasher,
    ILogger<AdminUsuariosController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UsuarioAdminDto>>> Listar(CancellationToken ct)
        => Ok(await db.UsuariosAdmin.AsNoTracking()
            .OrderByDescending(u => u.Role)
            .ThenBy(u => u.Nome)
            .Select(u => ToDto(u))
            .ToListAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UsuarioAdminDto>> Obter(Guid id, CancellationToken ct)
    {
        var u = await db.UsuariosAdmin.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return u is null ? NotFound() : Ok(ToDto(u));
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioAdminDto>> Criar([FromBody] UsuarioCriarDto dto, CancellationToken ct)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await db.UsuariosAdmin.AnyAsync(u => u.Email == email, ct))
            return ValidationProblem("Já existe um usuário com este e-mail.");

        var u = new UsuarioAdmin
        {
            Nome = dto.Nome.Trim(),
            Email = email,
            SenhaHash = hasher.Hash(dto.Senha),
            Role = UsuarioAdminRole.Admin, // Master só cria Admin.
            Ativo = true
        };
        db.UsuariosAdmin.Add(u);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Usuário Admin criado: {Email}.", email);
        return CreatedAtAction(nameof(Obter), new { id = u.Id }, ToDto(u));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UsuarioAdminDto>> Editar(Guid id, [FromBody] UsuarioEditarDto dto, CancellationToken ct)
    {
        var u = await db.UsuariosAdmin.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (u is null) return NotFound();
        if (u.Role != UsuarioAdminRole.Admin)
            return ValidationProblem("Apenas usuários Admin podem ser editados por aqui.");

        var email = dto.Email.Trim().ToLowerInvariant();
        if (await db.UsuariosAdmin.AnyAsync(x => x.Email == email && x.Id != id, ct))
            return ValidationProblem("Já existe um usuário com este e-mail.");

        u.Nome = dto.Nome.Trim();
        u.Email = email;
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(u));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<UsuarioAdminDto>> AlterarStatus(Guid id, [FromBody] UsuarioStatusDto dto, CancellationToken ct)
    {
        var u = await db.UsuariosAdmin.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (u is null) return NotFound();
        if (u.Id == CurrentUserId())
            return ValidationProblem("Você não pode alterar o próprio status.");
        if (u.Role != UsuarioAdminRole.Admin)
            return ValidationProblem("Apenas usuários Admin podem ser ativados/desativados por aqui.");

        u.Ativo = dto.Ativo;
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(u));
    }

    [HttpPost("{id:guid}/redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha(Guid id, [FromBody] RedefinirSenhaDto dto, CancellationToken ct)
    {
        var u = await db.UsuariosAdmin.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (u is null) return NotFound();
        if (u.Role != UsuarioAdminRole.Admin)
            return ValidationProblem("Use 'alterar a própria senha' para a conta Master.");

        u.SenhaHash = hasher.Hash(dto.NovaSenha);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Senha redefinida para o usuário {Email}.", u.Email);
        return NoContent();
    }

    private Guid CurrentUserId()
        => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub"), out var id)
            ? id
            : Guid.Empty;

    private static UsuarioAdminDto ToDto(UsuarioAdmin u) => new(
        u.Id, u.Nome, u.Email, u.Role.ToString(), u.Ativo, u.UltimoLoginEm, u.CriadoEm);
}
