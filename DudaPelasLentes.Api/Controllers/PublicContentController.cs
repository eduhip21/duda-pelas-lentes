using DudaPelasLentes.Api.Data;
using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DudaPelasLentes.Api.Controllers;

[ApiController]
[Route("api/public")]
[Produces("application/json")]
public sealed class PublicContentController(DudaPelasLentesDbContext db) : ControllerBase
{
    private const int DestaquesMax = 8;
    private const int DepoimentosMax = 12;
    private const int InstagramMax = 12;

    [HttpGet("home")]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<HomeDto>> GetHome(CancellationToken ct)
    {
        var conteudo = await db.ConteudoSite.AsNoTracking().FirstOrDefaultAsync(ct)
                       ?? new Entities.ConteudoSite();
        var config = await db.ConfiguracaoSite.AsNoTracking().FirstOrDefaultAsync(ct)
                     ?? new Entities.ConfiguracaoSite();

        var categorias = await db.Categorias.AsNoTracking()
            .Where(c => c.Ativa)
            .OrderBy(c => c.Ordem).ThenBy(c => c.Nome)
            .Select(c => c.ToPublic())
            .ToListAsync(ct);

        var destaques = await db.Fotos.AsNoTracking()
            .Where(f => f.Destaque && f.Ensaio!.Publicado)
            .OrderBy(f => f.Ordem)
            .Take(DestaquesMax)
            .Select(f => f.ToPublic())
            .ToListAsync(ct);

        var depoimentos = (await db.Depoimentos.AsNoTracking()
                .Where(d => d.Ativo)
                .OrderBy(d => d.Ordem).ThenByDescending(d => d.CriadoEm)
                .Take(DepoimentosMax)
                .ToListAsync(ct))
            .Select(d => d.ToPublic())
            .ToList();

        var instagram = await db.InstagramFotos.AsNoTracking()
            .Where(i => i.Ativo)
            .OrderBy(i => i.Ordem)
            .Take(InstagramMax)
            .Select(i => i.ToPublic())
            .ToListAsync(ct);

        var home = new HomeDto(
            Hero: new HomeHeroDto(
                conteudo.HeroTitulo, conteudo.HeroTituloDestaque, conteudo.HeroSubtitulo,
                conteudo.HeroImagem, conteudo.HeroBotaoPrimarioTexto, conteudo.HeroBotaoPrimarioLink,
                conteudo.HeroBotaoSecundarioTexto, conteudo.HeroBotaoSecundarioWhatsApp),
            Sobre: new HomeSobreResumoDto(
                conteudo.SobreTitulo, conteudo.SobreSaudacao, conteudo.SobreTextoResumo,
                conteudo.SobreImagem, conteudo.SobreBotaoTexto),
            Cta: new HomeCtaDto(
                conteudo.CtaTitulo, conteudo.CtaTexto, conteudo.CtaBotaoTexto, conteudo.CtaImagem),
            Titulos: new HomeSecoesDto(
                conteudo.HistoriasTitulo, conteudo.MomentosTitulo,
                conteudo.DepoimentosTitulo, conteudo.InstagramTitulo),
            Categorias: categorias,
            Destaques: destaques,
            Depoimentos: depoimentos,
            Instagram: instagram,
            Configuracoes: config.ToPublic());

        return Ok(home);
    }

    [HttpGet("sobre")]
    [ResponseCache(Duration = 120)]
    public async Task<ActionResult<SobrePaginaDto>> GetSobre(CancellationToken ct)
    {
        var c = await db.ConteudoSite.AsNoTracking().FirstOrDefaultAsync(ct)
                ?? new Entities.ConteudoSite();

        return Ok(new SobrePaginaDto(
            c.SobreTitulo, c.SobreSaudacao, c.SobreTextoResumo,
            c.SobrePaginaTexto, c.SobrePaginaTextoComplementar, c.SobreImagem));
    }

    [HttpGet("categorias")]
    [ResponseCache(Duration = 120)]
    public async Task<ActionResult<IReadOnlyList<CategoriaPublicaDto>>> GetCategorias(CancellationToken ct)
        => Ok(await db.Categorias.AsNoTracking()
            .Where(c => c.Ativa)
            .OrderBy(c => c.Ordem).ThenBy(c => c.Nome)
            .Select(c => c.ToPublic())
            .ToListAsync(ct));

    [HttpGet("servicos")]
    [ResponseCache(Duration = 120)]
    public async Task<ActionResult<IReadOnlyList<ServicoPublicoDto>>> GetServicos(CancellationToken ct)
        => Ok(await db.Servicos.AsNoTracking()
            .Where(s => s.Ativo)
            .OrderBy(s => s.Ordem).ThenBy(s => s.Titulo)
            .Select(s => s.ToPublic())
            .ToListAsync(ct));

    [HttpGet("depoimentos")]
    [ResponseCache(Duration = 120)]
    public async Task<ActionResult<IReadOnlyList<DepoimentoPublicoDto>>> GetDepoimentos(CancellationToken ct)
        => Ok((await db.Depoimentos.AsNoTracking()
                .Where(d => d.Ativo)
                .OrderBy(d => d.Ordem).ThenByDescending(d => d.CriadoEm)
                .ToListAsync(ct))
            .Select(d => d.ToPublic())
            .ToList());

    [HttpGet("configuracoes")]
    [ResponseCache(Duration = 120)]
    public async Task<ActionResult<ConfiguracaoPublicaDto>> GetConfiguracoes(CancellationToken ct)
    {
        var c = await db.ConfiguracaoSite.AsNoTracking().FirstOrDefaultAsync(ct)
                ?? new Entities.ConfiguracaoSite();
        return Ok(c.ToPublic());
    }
}
