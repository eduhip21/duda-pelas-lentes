using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers.Admin;

/// <summary>Edição do conteúdo da Home / Sobre e das configurações gerais do site.</summary>
[Route("api/admin/conteudo")]
public sealed class AdminConteudoController(DudaPelasLentesDbContext db) : AdminControllerBase
{
    // ---------- Home / Sobre ----------

    [HttpGet("home")]
    public async Task<ActionResult<ConteudoSiteDto>> GetHome(CancellationToken ct)
    {
        var c = await GetOrCreateConteudoAsync(ct);
        return Ok(Map(c));
    }

    [HttpPut("home")]
    public async Task<ActionResult<ConteudoSiteDto>> UpdateHome([FromBody] ConteudoSiteDto dto, CancellationToken ct)
    {
        var c = await GetOrCreateConteudoAsync(ct);

        c.HeroTitulo = dto.HeroTitulo.Trim();
        c.HeroTituloDestaque = dto.HeroTituloDestaque.Trim();
        c.HeroSubtitulo = dto.HeroSubtitulo;
        c.HeroImagem = Nullify(dto.HeroImagem);
        c.HeroBotaoPrimarioTexto = dto.HeroBotaoPrimarioTexto.Trim();
        c.HeroBotaoPrimarioLink = string.IsNullOrWhiteSpace(dto.HeroBotaoPrimarioLink) ? "/portfolio" : dto.HeroBotaoPrimarioLink.Trim();
        c.HeroBotaoSecundarioTexto = dto.HeroBotaoSecundarioTexto.Trim();
        c.HeroBotaoSecundarioWhatsApp = dto.HeroBotaoSecundarioWhatsApp;

        c.SobreTitulo = dto.SobreTitulo.Trim();
        c.SobreSaudacao = dto.SobreSaudacao.Trim();
        c.SobreTextoResumo = dto.SobreTextoResumo;
        c.SobreImagem = Nullify(dto.SobreImagem);
        c.SobreBotaoTexto = dto.SobreBotaoTexto.Trim();
        c.SobrePaginaTexto = dto.SobrePaginaTexto;
        c.SobrePaginaTextoComplementar = dto.SobrePaginaTextoComplementar;

        c.CtaTitulo = dto.CtaTitulo.Trim();
        c.CtaTexto = dto.CtaTexto.Trim();
        c.CtaBotaoTexto = dto.CtaBotaoTexto.Trim();
        c.CtaImagem = Nullify(dto.CtaImagem);

        c.HistoriasTitulo = dto.HistoriasTitulo.Trim();
        c.MomentosTitulo = dto.MomentosTitulo.Trim();
        c.DepoimentosTitulo = dto.DepoimentosTitulo.Trim();
        c.InstagramTitulo = dto.InstagramTitulo.Trim();

        c.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(Map(c));
    }

    // ---------- Configurações ----------

    [HttpGet("configuracoes")]
    public async Task<ActionResult<ConfiguracaoSiteDto>> GetConfig(CancellationToken ct)
    {
        var c = await GetOrCreateConfigAsync(ct);
        return Ok(MapConfig(c));
    }

    [HttpPut("configuracoes")]
    public async Task<ActionResult<ConfiguracaoSiteDto>> UpdateConfig([FromBody] ConfiguracaoSiteDto dto, CancellationToken ct)
    {
        var c = await GetOrCreateConfigAsync(ct);

        c.NomeMarca = dto.NomeMarca.Trim();
        c.Instagram = Nullify(dto.Instagram)?.TrimStart('@');
        c.WhatsApp = Nullify(dto.WhatsApp);
        c.MensagemWhatsApp = dto.MensagemWhatsApp.Trim();
        c.Email = Nullify(dto.Email);
        c.Cidade = Nullify(dto.Cidade);
        c.RegiaoAtendida = Nullify(dto.RegiaoAtendida);
        c.DesdeAno = dto.DesdeAno is >= 1990 and <= 2100 ? dto.DesdeAno : c.DesdeAno;
        c.Logo = Nullify(dto.Logo);
        c.Favicon = Nullify(dto.Favicon);
        c.ImagemSocial = Nullify(dto.ImagemSocial);
        c.SeoTitle = dto.SeoTitle.Trim();
        c.SeoDescription = dto.SeoDescription.Trim();
        c.TextoRodape = dto.TextoRodape.Trim();

        c.AtualizadoEm = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(MapConfig(c));
    }

    // ---------- helpers ----------

    private async Task<ConteudoSite> GetOrCreateConteudoAsync(CancellationToken ct)
    {
        var c = await db.ConteudoSite.FirstOrDefaultAsync(ct);
        if (c is null)
        {
            c = new ConteudoSite { Id = 1 };
            db.ConteudoSite.Add(c);
            await db.SaveChangesAsync(ct);
        }
        return c;
    }

    private async Task<ConfiguracaoSite> GetOrCreateConfigAsync(CancellationToken ct)
    {
        var c = await db.ConfiguracaoSite.FirstOrDefaultAsync(ct);
        if (c is null)
        {
            c = new ConfiguracaoSite { Id = 1 };
            db.ConfiguracaoSite.Add(c);
            await db.SaveChangesAsync(ct);
        }
        return c;
    }

    private static string? Nullify(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static ConteudoSiteDto Map(ConteudoSite c) => new()
    {
        HeroTitulo = c.HeroTitulo,
        HeroTituloDestaque = c.HeroTituloDestaque,
        HeroSubtitulo = c.HeroSubtitulo,
        HeroImagem = c.HeroImagem,
        HeroBotaoPrimarioTexto = c.HeroBotaoPrimarioTexto,
        HeroBotaoPrimarioLink = c.HeroBotaoPrimarioLink,
        HeroBotaoSecundarioTexto = c.HeroBotaoSecundarioTexto,
        HeroBotaoSecundarioWhatsApp = c.HeroBotaoSecundarioWhatsApp,
        SobreTitulo = c.SobreTitulo,
        SobreSaudacao = c.SobreSaudacao,
        SobreTextoResumo = c.SobreTextoResumo,
        SobreImagem = c.SobreImagem,
        SobreBotaoTexto = c.SobreBotaoTexto,
        SobrePaginaTexto = c.SobrePaginaTexto,
        SobrePaginaTextoComplementar = c.SobrePaginaTextoComplementar,
        CtaTitulo = c.CtaTitulo,
        CtaTexto = c.CtaTexto,
        CtaBotaoTexto = c.CtaBotaoTexto,
        CtaImagem = c.CtaImagem,
        HistoriasTitulo = c.HistoriasTitulo,
        MomentosTitulo = c.MomentosTitulo,
        DepoimentosTitulo = c.DepoimentosTitulo,
        InstagramTitulo = c.InstagramTitulo
    };

    private static ConfiguracaoSiteDto MapConfig(ConfiguracaoSite c) => new()
    {
        NomeMarca = c.NomeMarca,
        Instagram = c.Instagram,
        WhatsApp = c.WhatsApp,
        MensagemWhatsApp = c.MensagemWhatsApp,
        Email = c.Email,
        Cidade = c.Cidade,
        RegiaoAtendida = c.RegiaoAtendida,
        DesdeAno = c.DesdeAno,
        Logo = c.Logo,
        Favicon = c.Favicon,
        ImagemSocial = c.ImagemSocial,
        SeoTitle = c.SeoTitle,
        SeoDescription = c.SeoDescription,
        TextoRodape = c.TextoRodape
    };
}
