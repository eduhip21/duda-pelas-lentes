using System.Text;
using DudaPelasLentes.Api.Configuration;
using DudaPelasLentes.Api.Services;
using DudaPelasLentes.Api.Storage;
using Microsoft.Extensions.Options;

namespace DudaPelasLentes.Api.Tests;

public class SlugServiceTests
{
    private readonly SlugService _slugs = new();

    [Theory]
    [InlineData("Famílias", "familias")]
    [InlineData("Ensaio Família Silva", "ensaio-familia-silva")]
    [InlineData("Gestante — Ana & João", "gestante-ana-joao")]
    [InlineData("   múltiplos   espaços   ", "multiplos-espacos")]
    public void Generate_normaliza_acentos_e_espacos(string input, string esperado)
        => Assert.Equal(esperado, _slugs.Generate(input));

    [Fact]
    public void Generate_com_entrada_vazia_gera_fallback()
        => Assert.False(string.IsNullOrWhiteSpace(_slugs.Generate("")));

    [Fact]
    public async Task GenerateUniqueAsync_incrementa_sufixo_quando_ja_existe()
    {
        var existentes = new HashSet<string> { "ana", "ana-2" };
        var slug = await _slugs.GenerateUniqueAsync("Ana", s => Task.FromResult(existentes.Contains(s)));
        Assert.Equal("ana-3", slug);
    }
}

public class PasswordHasherTests
{
    private readonly PasswordHasherService _hasher = new();

    [Fact]
    public void Hash_nao_retorna_senha_em_texto_claro()
    {
        var hash = _hasher.Hash("minha-senha-secreta");
        Assert.DoesNotContain("minha-senha-secreta", hash);
        Assert.True(hash.Length > 20);
    }

    [Fact]
    public void Verify_aceita_senha_correta_e_rejeita_incorreta()
    {
        var hash = _hasher.Hash("Correta#123");
        Assert.True(_hasher.Verify(hash, "Correta#123"));
        Assert.False(_hasher.Verify(hash, "Errada#123"));
    }
}

public class SiteLinkHelperTests
{
    [Theory]
    [InlineData("55 (48) 99999-9999", "https://wa.me/5548999999999")]
    [InlineData("+55 48 3333 4444", "https://wa.me/554833334444")]
    public void BuildWhatsAppUrl_extrai_apenas_digitos(string entrada, string esperadoPrefixo)
    {
        var url = SiteLinkHelper.BuildWhatsAppUrl(entrada, null);
        Assert.StartsWith(esperadoPrefixo, url);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("123")]
    public void BuildWhatsAppUrl_retorna_null_para_numero_invalido(string? entrada)
        => Assert.Null(SiteLinkHelper.BuildWhatsAppUrl(entrada, "oi"));

    [Fact]
    public void BuildWhatsAppUrl_codifica_a_mensagem()
    {
        var url = SiteLinkHelper.BuildWhatsAppUrl("5548999999999", "Olá, tudo bem?");
        Assert.Contains("text=Ol%C3%A1", url);
    }

    [Theory]
    [InlineData("@dudapelaslentes", "https://instagram.com/dudapelaslentes")]
    [InlineData("duda.lentes", "https://instagram.com/duda.lentes")]
    public void BuildInstagramUrl_remove_arroba(string handle, string esperado)
        => Assert.Equal(esperado, SiteLinkHelper.BuildInstagramUrl(handle));
}

public class LocalFileStorageTests
{
    private static LocalFileStorage CreateStorage(out string root)
    {
        root = Path.Combine(Path.GetTempPath(), "dpl-test-" + Guid.NewGuid().ToString("n"));
        var opts = Options.Create(new StorageOptions { LocalRootPath = root, PublicBasePath = "/media" });
        var env = new FakeEnv();
        return new LocalFileStorage(opts, env);
    }

    [Fact]
    public async Task SaveAsync_grava_arquivo_e_retorna_path_publico()
    {
        var storage = CreateStorage(out var root);
        try
        {
            using var ms = new MemoryStream(Encoding.UTF8.GetBytes("conteudo"));
            var url = await storage.SaveAsync("ensaios/abc/foto.jpg", ms, "image/jpeg");
            Assert.Equal("/media/ensaios/abc/foto.jpg", url);
            Assert.True(File.Exists(Path.Combine(root, "ensaios", "abc", "foto.jpg")));
        }
        finally
        {
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }

    [Theory]
    [InlineData("../../fora.jpg")]
    [InlineData("ensaios/../../fora.jpg")]
    [InlineData("..\\..\\windows\\system32\\x.jpg")]
    public async Task SaveAsync_bloqueia_path_traversal(string chave)
    {
        var storage = CreateStorage(out var root);
        try
        {
            using var ms = new MemoryStream([1, 2, 3]);
            await Assert.ThrowsAnyAsync<Exception>(() => storage.SaveAsync(chave, ms, "image/jpeg"));
        }
        finally
        {
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }

    private sealed class FakeEnv : Microsoft.Extensions.Hosting.IHostEnvironment
    {
        public string ApplicationName { get; set; } = "test";
        public string EnvironmentName { get; set; } = "Development";
        public string ContentRootPath { get; set; } = Path.GetTempPath();
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = null!;
    }
}

public class ImageUploadValidationTests
{
    private static ImageUploadService Create()
    {
        var storage = new FakeStorage();
        var opts = Options.Create(new ImageOptions());
        return new ImageUploadService(storage, opts);
    }

    [Fact]
    public async Task ProcessAsync_rejeita_extensao_nao_permitida()
    {
        var svc = Create();
        using var ms = new MemoryStream(Encoding.UTF8.GetBytes("fake"));
        await Assert.ThrowsAsync<ImageValidationException>(
            () => svc.ProcessAsync(ms, "arquivo.gif", "image/gif", "misc"));
    }

    [Fact]
    public async Task ProcessAsync_rejeita_conteudo_que_nao_e_imagem()
    {
        var svc = Create();
        using var ms = new MemoryStream(Encoding.UTF8.GetBytes("isto nao e uma imagem de verdade"));
        await Assert.ThrowsAsync<ImageValidationException>(
            () => svc.ProcessAsync(ms, "arquivo.jpg", "image/jpeg", "misc"));
    }

    private sealed class FakeStorage : IFileStorage
    {
        public Task<string> SaveAsync(string relativeKey, Stream content, string contentType, CancellationToken ct = default)
            => Task.FromResult("/media/" + relativeKey);
        public Task DeleteAsync(string relativeKey, CancellationToken ct = default) => Task.CompletedTask;
        public string GetPublicUrl(string relativeKey) => "/media/" + relativeKey;
    }
}
