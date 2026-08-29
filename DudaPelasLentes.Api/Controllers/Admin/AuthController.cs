using System.Security.Claims;
using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/auth")]
[Produces("application/json")]
public sealed class AuthController(
    DudaPelasLentesDbContext db,
    IPasswordHasherService hasher,
    IJwtTokenService jwt,
    ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto req, CancellationToken ct)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await db.UsuariosAdmin.FirstOrDefaultAsync(u => u.Email == email, ct);

        // Verificação em tempo ~constante: sempre roda um hash.
        var senhaOk = user is not null && hasher.Verify(user.SenhaHash, req.Senha);
        if (user is null || !senhaOk || !user.Ativo)
        {
            logger.LogWarning("Tentativa de login falhou para {Email}.", email);
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });
        }

        user.UltimoLoginEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var (token, expiresAt) = jwt.CreateToken(user);
        return Ok(new LoginResponseDto(token, expiresAt, user.Nome, user.Email));
    }

    [HttpGet("me")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<UsuarioAdminDto>> Me(CancellationToken ct)
    {
        var id = GetUserId();
        var user = await db.UsuariosAdmin.FindAsync([id], ct);
        return user is null
            ? Unauthorized()
            : Ok(new UsuarioAdminDto(user.Id, user.Nome, user.Email, user.Ativo, user.UltimoLoginEm));
    }

    [HttpPost("alterar-senha")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> AlterarSenha([FromBody] AlterarSenhaDto req, CancellationToken ct)
    {
        var user = await db.UsuariosAdmin.FindAsync([GetUserId()], ct);
        if (user is null) return Unauthorized();

        if (!hasher.Verify(user.SenhaHash, req.SenhaAtual))
            return ValidationProblem("Senha atual incorreta.");

        user.SenhaHash = hasher.Hash(req.NovaSenha);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private Guid GetUserId()
        => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue("sub"), out var id)
            ? id
            : Guid.Empty;
}
