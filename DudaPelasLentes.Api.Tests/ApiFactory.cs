using DudaPelasLentes.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace DudaPelasLentes.Api.Tests;

/// <summary>
/// Sobe a API real em memória usando SQLite (conexão mantida aberta durante o teste).
/// Fornece um admin de bootstrap conhecido para os testes de autenticação.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin.teste@dudapelaslentes.dev";
    public const string AdminPassword = "SenhaForte#Teste123";

    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        _connection.Open();
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=fake;Username=fake",
                ["Jwt:Key"] = "chave-de-teste-com-mais-de-32-caracteres-para-hs256-000",
                ["BootstrapAdmin:Email"] = AdminEmail,
                ["BootstrapAdmin:Password"] = AdminPassword,
                ["Images:MaxUploadBytes"] = "2000000",
                ["RateLimiting:Enabled"] = "false",
            });
        });

        builder.ConfigureServices(services =>
        {
            var remover = services.Where(d =>
                d.ServiceType == typeof(DbContextOptions<DudaPelasLentesDbContext>) ||
                d.ServiceType == typeof(DbContextOptions) ||
                d.ServiceType == typeof(DudaPelasLentesDbContext) ||
                (d.ServiceType.IsGenericType &&
                 d.ServiceType.GetGenericTypeDefinition().Name.StartsWith("IDbContextOptionsConfiguration")) ||
                (d.ServiceType.FullName?.Contains("Npgsql") ?? false)).ToList();
            foreach (var d in remover) services.Remove(d);

            services.AddDbContext<DudaPelasLentesDbContext>(o => o.UseSqlite(_connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}
