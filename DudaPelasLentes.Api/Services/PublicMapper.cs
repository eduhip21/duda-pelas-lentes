using DudaPelasLentes.Api.DTOs;
using DudaPelasLentes.Api.Entities;

namespace DudaPelasLentes.Api.Services;

/// <summary>Converte entidades em DTOs públicos. Nunca inclui dados administrativos ou hashes.</summary>
public static class PublicMapper
{
    public static ConfiguracaoPublicaDto ToPublic(this ConfiguracaoSite c) => new(
        NomeMarca: c.NomeMarca,
        Instagram: c.Instagram,
        InstagramUrl: SiteLinkHelper.BuildInstagramUrl(c.Instagram),
        WhatsAppUrl: SiteLinkHelper.BuildWhatsAppUrl(c.WhatsApp, c.MensagemWhatsApp),
        Email: c.Email,
        Cidade: c.Cidade,
        RegiaoAtendida: c.RegiaoAtendida,
        DesdeAno: c.DesdeAno,
        Logo: c.Logo,
        TextoRodape: c.TextoRodape,
        SeoTitle: c.SeoTitle,
        SeoDescription: c.SeoDescription,
        ImagemSocial: c.ImagemSocial);

    public static CategoriaPublicaDto ToPublic(this CategoriaPortfolio c) => new(
        c.Id, c.Nome, c.Slug, c.Descricao, c.ImagemCapa, c.Icone, c.Ordem);

    public static FotoPublicaDto ToPublic(this Foto f) => new(
        f.Id, f.ArquivoLarge, f.ArquivoMedium, f.ArquivoThumb, f.Alt, f.Ordem);

    public static DepoimentoPublicoDto ToPublic(this Depoimento d) => new(
        d.Id, d.NomeCliente, d.Texto, d.Foto, d.Data?.ToString("yyyy-MM-dd"));

    public static InstagramFotoPublicaDto ToPublic(this InstagramFoto i) => new(
        i.Id, i.ArquivoMedium, i.ArquivoThumb, i.Alt, i.LinkExterno);

    public static ServicoPublicoDto ToPublic(this Servico s) => new(
        s.Id, s.Titulo, s.Slug, s.DescricaoCurta, s.Descricao, s.ImagemCapa, s.Ordem);

    public static EnsaioResumoDto ToResumo(this Ensaio e) => new(
        e.Id, e.Titulo, e.Slug, e.Descricao,
        e.Categoria?.Slug ?? string.Empty,
        e.Categoria?.Nome ?? string.Empty,
        e.FotoCapa,
        e.DataEnsaio?.ToString("yyyy-MM-dd"),
        e.Local, e.Destaque, e.Ordem);

    public static EnsaioDetalheDto ToDetalhe(this Ensaio e) => new(
        e.Id, e.Titulo, e.Slug, e.Descricao,
        e.Categoria?.Slug ?? string.Empty,
        e.Categoria?.Nome ?? string.Empty,
        e.FotoCapa,
        e.DataEnsaio?.ToString("yyyy-MM-dd"),
        e.Local,
        e.Fotos.OrderBy(f => f.Ordem).Select(f => f.ToPublic()).ToList());
}
