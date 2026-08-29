using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace DudaPelasLentes.Api.Tests;

public class IntegrationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory = factory;

    private async Task<string> LoginAsync(string? email = null, string? senha = null)
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/admin/auth/login", new
        {
            email = email ?? ApiFactory.AdminEmail,
            senha = senha ?? ApiFactory.AdminPassword,
        });
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        return body.GetProperty("token").GetString()!;
    }

    /// <summary>Autentica como Master (bootstrap) e cria um Admin, devolvendo o token do Admin.</summary>
    private async Task<string> CriarELogarAdminAsync(string email, string senha)
    {
        var master = _factory.CreateClient();
        master.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        var criar = await master.PostAsJsonAsync("/api/admin/usuarios", new
        {
            nome = "Duda Fotógrafa",
            email,
            senha,
        });
        criar.EnsureSuccessStatusCode();

        return await LoginAsync(email, senha);
    }

    // ---------- Auth ----------

    [Fact]
    public async Task Login_com_credenciais_validas_retorna_token()
    {
        var token = await LoginAsync();
        Assert.False(string.IsNullOrWhiteSpace(token));
    }

    [Fact]
    public async Task Login_com_senha_errada_retorna_401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/admin/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            senha = "senha-errada",
        });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    // ---------- Autorização ----------

    [Fact]
    public async Task Endpoint_admin_sem_token_retorna_401()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/admin/dashboard");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Endpoint_admin_com_token_retorna_200()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());
        var res = await client.GetAsync("/api/admin/dashboard");
        res.EnsureSuccessStatusCode();
    }

    // ---------- Perfis Master / Admin ----------

    [Fact]
    public async Task Bootstrap_efetua_login_como_Master()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/admin/auth/login", new
        {
            email = ApiFactory.AdminEmail,
            senha = ApiFactory.AdminPassword,
        });
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Master", body.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Admin_criado_pelo_Master_efetua_login()
    {
        var token = await CriarELogarAdminAsync("admin.login@dudapelaslentes.dev", "SenhaAdmin#2026");
        Assert.False(string.IsNullOrWhiteSpace(token));

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var me = await client.GetFromJsonAsync<JsonElement>("/api/admin/auth/me");
        Assert.Equal("Admin", me.GetProperty("role").GetString());
    }

    [Fact]
    public async Task Master_acessa_gestao_de_usuarios()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());
        var res = await client.GetAsync("/api/admin/usuarios");
        res.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Admin_acessa_conteudo_administrativo()
    {
        var token = await CriarELogarAdminAsync("admin.conteudo@dudapelaslentes.dev", "SenhaAdmin#2026");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/dashboard")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/categorias")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/depoimentos")).StatusCode);
    }

    [Fact]
    public async Task Admin_recebe_403_na_gestao_de_usuarios()
    {
        var token = await CriarELogarAdminAsync("admin.403@dudapelaslentes.dev", "SenhaAdmin#2026");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/usuarios")).StatusCode);
        var criar = await client.PostAsJsonAsync("/api/admin/usuarios", new
        {
            nome = "X", email = "x@x.dev", senha = "SenhaAlgo#2026",
        });
        Assert.Equal(HttpStatusCode.Forbidden, criar.StatusCode);
    }

    [Fact]
    public async Task Visitante_recebe_401_na_gestao_de_usuarios()
    {
        var client = _factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/admin/usuarios")).StatusCode);
    }

    [Fact]
    public async Task Master_nao_desativa_o_proprio_acesso()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        var usuarios = await client.GetFromJsonAsync<List<JsonElement>>("/api/admin/usuarios");
        var master = usuarios!.First(u => u.GetProperty("role").GetString() == "Master");
        var id = master.GetProperty("id").GetString();

        var res = await client.PatchAsJsonAsync($"/api/admin/usuarios/{id}/status", new { ativo = false });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Master_redefine_senha_de_Admin()
    {
        await CriarELogarAdminAsync("admin.reset@dudapelaslentes.dev", "SenhaAdmin#2026");
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        var usuarios = await client.GetFromJsonAsync<List<JsonElement>>("/api/admin/usuarios");
        var alvo = usuarios!.First(u => u.GetProperty("email").GetString() == "admin.reset@dudapelaslentes.dev");
        var id = alvo.GetProperty("id").GetString();

        var res = await client.PostAsJsonAsync($"/api/admin/usuarios/{id}/redefinir-senha", new { novaSenha = "NovaSenha#2026" });
        Assert.Equal(HttpStatusCode.NoContent, res.StatusCode);

        var relogin = await LoginAsync("admin.reset@dudapelaslentes.dev", "NovaSenha#2026");
        Assert.False(string.IsNullOrWhiteSpace(relogin));
    }

    // ---------- Endpoints públicos / DTO público ----------

    [Fact]
    public async Task Home_publica_retorna_estrutura_agregada()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/public/home");
        res.EnsureSuccessStatusCode();

        var json = await res.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.True(root.TryGetProperty("hero", out _));
        Assert.True(root.TryGetProperty("cta", out _));
        Assert.True(root.TryGetProperty("configuracoes", out _));
        Assert.True(root.TryGetProperty("categorias", out var cats));
        Assert.True(cats.GetArrayLength() >= 5); // ao menos o seed inicial
        Assert.DoesNotContain("senhaHash", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("SenhaHash", json);
    }

    [Fact]
    public async Task Configuracoes_publicas_nunca_expoem_dados_administrativos()
    {
        var client = _factory.CreateClient();
        var json = await client.GetStringAsync("/api/public/configuracoes");
        Assert.DoesNotContain("senhaHash", json, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("nomeMarca", json);
    }

    [Fact]
    public async Task Categorias_publicas_vem_do_seed_ordenadas()
    {
        var client = _factory.CreateClient();
        var cats = await client.GetFromJsonAsync<List<JsonElement>>("/api/public/categorias");
        Assert.NotNull(cats);
        Assert.Contains(cats!, c => c.GetProperty("nome").GetString() == "Ensaios");
    }

    // ---------- Contato ----------

    [Fact]
    public async Task Contato_valido_e_aceito()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/public/contato", new
        {
            nome = "Maria Teste",
            email = "maria@example.com",
            mensagem = "Gostaria de um orçamento para ensaio de família em outubro.",
        });
        Assert.Equal(HttpStatusCode.Accepted, res.StatusCode);
    }

    [Fact]
    public async Task Contato_com_honeypot_preenchido_e_descartado_silenciosamente()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/public/contato", new
        {
            nome = "Bot",
            email = "bot@spam.com",
            mensagem = "spam spam spam spam spam",
            website = "http://spam.com",
        });
        Assert.Equal(HttpStatusCode.Accepted, res.StatusCode);
    }

    [Fact]
    public async Task Contato_invalido_retorna_400()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/public/contato", new
        {
            nome = "",
            email = "nao-e-email",
            mensagem = "curto",
        });
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    // ---------- Categorias / Ensaios (admin) ----------

    [Fact]
    public async Task Admin_cria_categoria_com_slug_gerado_automaticamente()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        var res = await client.PostAsJsonAsync("/api/admin/categorias", new
        {
            nome = "Aniversários Infantis",
            ativa = true,
            ordem = 10,
        });
        res.EnsureSuccessStatusCode();
        var body = await res.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("aniversarios-infantis", body.GetProperty("slug").GetString());
    }

    [Fact]
    public async Task Admin_cria_ensaio_e_ele_so_aparece_no_publico_apos_publicado()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        var cats = await client.GetFromJsonAsync<List<JsonElement>>("/api/admin/categorias");
        var catId = cats![0].GetProperty("id").GetString();

        var criar = await client.PostAsJsonAsync("/api/admin/ensaios", new
        {
            titulo = "Ensaio Rascunho Teste",
            categoriaId = catId,
            publicado = false,
        });
        criar.EnsureSuccessStatusCode();
        var ensaio = await criar.Content.ReadFromJsonAsync<JsonElement>();
        var slug = ensaio.GetProperty("slug").GetString();

        var publico = await client.GetAsync($"/api/public/portfolio/{slug}");
        Assert.Equal(HttpStatusCode.NotFound, publico.StatusCode);

        var id = ensaio.GetProperty("id").GetString();
        var pub = await client.PutAsJsonAsync($"/api/admin/ensaios/{id}", new
        {
            titulo = "Ensaio Rascunho Teste",
            categoriaId = catId,
            publicado = true,
        });
        pub.EnsureSuccessStatusCode();

        var publico2 = await client.GetAsync($"/api/public/portfolio/{slug}");
        publico2.EnsureSuccessStatusCode();
    }

    // ---------- Depoimentos ----------

    [Fact]
    public async Task Depoimento_inativo_nao_aparece_no_publico()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        await client.PostAsJsonAsync("/api/admin/depoimentos", new
        {
            nomeCliente = "Cliente Oculto",
            texto = "Esse depoimento está inativo e não deve aparecer no site publicamente.",
            ativo = false,
        });

        var json = await client.GetStringAsync("/api/public/depoimentos");
        Assert.DoesNotContain("Cliente Oculto", json);
    }

    // ---------- Upload / path traversal ----------

    [Fact]
    public async Task Upload_admin_rejeita_arquivo_que_nao_e_imagem()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        using var content = new MultipartFormDataContent();
        var bytes = new byte[] { 1, 2, 3, 4, 5, 6 };
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(file, "arquivo", "malicioso.jpg");

        var res = await client.PostAsync("/api/admin/uploads/hero", content);
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Upload_admin_rejeita_destino_desconhecido()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await LoginAsync());

        using var content = new MultipartFormDataContent();
        var file = new ByteArrayContent(new byte[] { 1, 2, 3 });
        file.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(file, "arquivo", "x.jpg");

        var res = await client.PostAsync("/api/admin/uploads/..%2F..%2Fetc", content);
        Assert.True(res.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.NotFound);
    }
}
