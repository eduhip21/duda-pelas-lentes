using System.ComponentModel.DataAnnotations;
using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DudaPelasLentes.Api.Controllers;

[ApiController]
[Route("api/public/contato")]
[Produces("application/json")]
public sealed class PublicContatoController(
    DudaPelasLentesDbContext db,
    ILogger<PublicContatoController> logger) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("contato")]
    [RequestSizeLimit(16 * 1024)]
    public async Task<IActionResult> Enviar([FromBody] ContatoRequestDto req, CancellationToken ct)
    {
        // Honeypot: se preenchido, respondemos 202 sem gravar (não damos pista ao bot).
        if (!string.IsNullOrWhiteSpace(req.Website))
        {
            logger.LogInformation("Contato descartado por honeypot.");
            return Accepted();
        }

        var erros = new List<string>();
        if (string.IsNullOrWhiteSpace(req.Nome) || req.Nome.Trim().Length < 2)
            erros.Add("Informe seu nome.");
        if (string.IsNullOrWhiteSpace(req.Email) || !new EmailAddressAttribute().IsValid(req.Email))
            erros.Add("Informe um e-mail válido.");
        if (string.IsNullOrWhiteSpace(req.Mensagem) || req.Mensagem.Trim().Length < 10)
            erros.Add("Escreva uma mensagem com mais detalhes.");
        if (req.Nome?.Length > 160 || req.Mensagem?.Length > 4000)
            erros.Add("Conteúdo muito longo.");

        if (erros.Count > 0)
            return ValidationProblem(string.Join(" ", erros));

        db.ContatoLeads.Add(new ContatoLead
        {
            Nome = req.Nome!.Trim(),
            Email = req.Email!.Trim(),
            WhatsApp = string.IsNullOrWhiteSpace(req.WhatsApp) ? null : req.WhatsApp.Trim(),
            TipoEnsaio = string.IsNullOrWhiteSpace(req.TipoEnsaio) ? null : req.TipoEnsaio.Trim(),
            Mensagem = req.Mensagem!.Trim(),
            Status = ContatoLeadStatus.Novo
        });

        await db.SaveChangesAsync(ct);
        return Accepted(new { mensagem = "Recebido! Em breve a Duda entra em contato." });
    }
}
