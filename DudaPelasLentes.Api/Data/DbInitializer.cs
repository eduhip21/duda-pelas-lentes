using DudaPelasLentes.Api.Configuration;
using DudaPelasLentes.Api.Entities;
using DudaPelasLentes.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DudaPelasLentes.Api.Data;

/// <summary>
/// Aplica migrations pendentes (quando possível), garante os singletons de conteúdo/configuração,
/// faz o seed de categorias iniciais e cria o admin de bootstrap somente em Development.
/// </summary>
public sealed class DbInitializer(
    DudaPelasLentesDbContext db,
    IPasswordHasherService hasher,
    ISlugService slugs,
    IOptions<BootstrapAdminOptions> bootstrapOptions,
    IHostEnvironment env,
    ILogger<DbInitializer> logger)
{
    private static readonly string[] CategoriasSeed =
        ["Ensaios", "Famílias", "Gestantes", "Casamentos", "Eventos"];

    private static readonly Dictionary<string, string> IconePorCategoria = new()
    {
        ["ensaios"] = "leaf",
        ["familias"] = "users",
        ["gestantes"] = "heart",
        ["casamentos"] = "rings",
        ["eventos"] = "camera"
    };

    public async Task RunAsync(CancellationToken ct = default)
    {
        var canConnect = await db.Database.CanConnectAsync(ct);
        if (!canConnect)
        {
            logger.LogWarning(
                "Banco de dados indisponível. Pulei migrations/seed. Configure a connection string e rode 'dotnet ef database update'.");
            return;
        }

        if (db.Database.IsNpgsql())
        {
            if ((await db.Database.GetPendingMigrationsAsync(ct)).Any())
                await db.Database.MigrateAsync(ct);
        }
        else
        {
            // Providers de teste (SQLite/InMemory): cria o schema direto do modelo.
            await db.Database.EnsureCreatedAsync(ct);
        }

        await EnsureSingletonsAsync(ct);
        await SeedCategoriasAsync(ct);
        await EnsureBootstrapAdminAsync(ct);
    }

    private async Task EnsureSingletonsAsync(CancellationToken ct)
    {
        if (!await db.ConteudoSite.AnyAsync(ct))
            db.ConteudoSite.Add(new ConteudoSite { Id = 1 });

        if (!await db.ConfiguracaoSite.AnyAsync(ct))
            db.ConfiguracaoSite.Add(new ConfiguracaoSite { Id = 1 });

        await db.SaveChangesAsync(ct);
    }

    private async Task SeedCategoriasAsync(CancellationToken ct)
    {
        if (await db.Categorias.AnyAsync(ct))
            return;

        var ordem = 0;
        foreach (var nome in CategoriasSeed)
        {
            var slug = slugs.Generate(nome);
            db.Categorias.Add(new CategoriaPortfolio
            {
                Nome = nome,
                Slug = slug,
                Ativa = true,
                Ordem = ordem++,
                Icone = IconePorCategoria.GetValueOrDefault(slug, "camera")
            });
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seed de {Count} categorias iniciais aplicado.", CategoriasSeed.Length);
    }

    private async Task EnsureBootstrapAdminAsync(CancellationToken ct)
    {
        if (!env.IsDevelopment())
            return;

        if (await db.UsuariosAdmin.AnyAsync(ct))
            return;

        var opts = bootstrapOptions.Value;
        if (!opts.IsConfigured)
        {
            logger.LogWarning(
                "Nenhum administrador cadastrado e BootstrapAdmin não configurado. "
                + "Defina os user-secrets BootstrapAdmin:Email e BootstrapAdmin:Password para criar o primeiro acesso.");
            return;
        }

        db.UsuariosAdmin.Add(new UsuarioAdmin
        {
            Nome = opts.Nome,
            Email = opts.Email!.Trim().ToLowerInvariant(),
            SenhaHash = hasher.Hash(opts.Password!),
            Ativo = true
        });

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Administrador de bootstrap criado para {Email}.", opts.Email);
    }
}
