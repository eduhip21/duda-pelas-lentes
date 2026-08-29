using DudaPelasLentes.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DudaPelasLentes.Api.Data;

public class DudaPelasLentesDbContext(DbContextOptions<DudaPelasLentesDbContext> options)
    : DbContext(options)
{
    public DbSet<UsuarioAdmin> UsuariosAdmin => Set<UsuarioAdmin>();
    public DbSet<CategoriaPortfolio> Categorias => Set<CategoriaPortfolio>();
    public DbSet<Ensaio> Ensaios => Set<Ensaio>();
    public DbSet<Foto> Fotos => Set<Foto>();
    public DbSet<Servico> Servicos => Set<Servico>();
    public DbSet<Depoimento> Depoimentos => Set<Depoimento>();
    public DbSet<InstagramFoto> InstagramFotos => Set<InstagramFoto>();
    public DbSet<ContatoLead> ContatoLeads => Set<ContatoLead>();
    public DbSet<ConteudoSite> ConteudoSite => Set<ConteudoSite>();
    public DbSet<ConfiguracaoSite> ConfiguracaoSite => Set<ConfiguracaoSite>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<UsuarioAdmin>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Nome).HasMaxLength(120).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.SenhaHash).HasMaxLength(400).IsRequired();
            e.Property(x => x.Role).HasConversion<string>().HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.Role);
        });

        b.Entity<CategoriaPortfolio>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Nome).HasMaxLength(120).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(140).IsRequired();
            e.Property(x => x.Descricao).HasMaxLength(1000);
            e.Property(x => x.ImagemCapa).HasMaxLength(500);
            e.Property(x => x.Icone).HasMaxLength(60);
        });

        b.Entity<Ensaio>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => new { x.Publicado, x.Ordem });
            e.HasIndex(x => x.Destaque);
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(240).IsRequired();
            e.Property(x => x.Descricao).HasMaxLength(4000);
            e.Property(x => x.Local).HasMaxLength(200);
            e.Property(x => x.FotoCapa).HasMaxLength(500);
            e.HasOne(x => x.Categoria)
                .WithMany(c => c.Ensaios)
                .HasForeignKey(x => x.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Foto>(e =>
        {
            e.HasIndex(x => new { x.EnsaioId, x.Ordem });
            e.HasIndex(x => x.Destaque);
            e.Property(x => x.ArquivoOriginal).HasMaxLength(500).IsRequired();
            e.Property(x => x.ArquivoLarge).HasMaxLength(500).IsRequired();
            e.Property(x => x.ArquivoMedium).HasMaxLength(500).IsRequired();
            e.Property(x => x.ArquivoThumb).HasMaxLength(500).IsRequired();
            e.Property(x => x.Alt).HasMaxLength(300);
            e.HasOne(x => x.Ensaio)
                .WithMany(en => en.Fotos)
                .HasForeignKey(x => x.EnsaioId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Servico>(e =>
        {
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasIndex(x => new { x.Ativo, x.Ordem });
            e.Property(x => x.Titulo).HasMaxLength(200).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(240).IsRequired();
            e.Property(x => x.DescricaoCurta).HasMaxLength(500);
            e.Property(x => x.Descricao).HasMaxLength(6000);
            e.Property(x => x.ImagemCapa).HasMaxLength(500);
        });

        b.Entity<Depoimento>(e =>
        {
            e.HasIndex(x => new { x.Ativo, x.Ordem });
            e.Property(x => x.NomeCliente).HasMaxLength(160).IsRequired();
            e.Property(x => x.Texto).HasMaxLength(2000).IsRequired();
            e.Property(x => x.Foto).HasMaxLength(500);
        });

        b.Entity<InstagramFoto>(e =>
        {
            e.HasIndex(x => new { x.Ativo, x.Ordem });
            e.Property(x => x.ArquivoMedium).HasMaxLength(500).IsRequired();
            e.Property(x => x.ArquivoThumb).HasMaxLength(500).IsRequired();
            e.Property(x => x.Alt).HasMaxLength(300);
            e.Property(x => x.LinkExterno).HasMaxLength(500);
        });

        b.Entity<ContatoLead>(e =>
        {
            e.HasIndex(x => new { x.Status, x.CriadoEm });
            e.Property(x => x.Nome).HasMaxLength(160).IsRequired();
            e.Property(x => x.Email).HasMaxLength(200).IsRequired();
            e.Property(x => x.WhatsApp).HasMaxLength(40);
            e.Property(x => x.TipoEnsaio).HasMaxLength(120);
            e.Property(x => x.Mensagem).HasMaxLength(4000).IsRequired();
        });

        b.Entity<ConteudoSite>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            foreach (var p in e.Metadata.GetProperties().Where(p => p.ClrType == typeof(string)))
                p.SetMaxLength(8000);
        });

        b.Entity<ConfiguracaoSite>(e =>
        {
            e.Property(x => x.Id).ValueGeneratedNever();
            foreach (var p in e.Metadata.GetProperties().Where(p => p.ClrType == typeof(string)))
                p.SetMaxLength(2000);
        });

        // SQLite (usado nos testes) não ordena/compara DateTimeOffset nativamente.
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
        {
            var converter = new DateTimeOffsetToBinaryConverter();
            foreach (var property in b.Model.GetEntityTypes()
                         .SelectMany(t => t.GetProperties())
                         .Where(p => p.ClrType == typeof(DateTimeOffset) || p.ClrType == typeof(DateTimeOffset?)))
            {
                property.SetValueConverter(converter);
            }
        }
    }
}
