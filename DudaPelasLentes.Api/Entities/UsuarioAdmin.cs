namespace DudaPelasLentes.Api.Entities;

/// <summary>Perfil administrativo. A única diferença relevante é a gestão de usuários.</summary>
public enum UsuarioAdminRole
{
    /// <summary>Administra todo o conteúdo do site. Não acessa a gestão de usuários.</summary>
    Admin = 0,

    /// <summary>Acesso total: conteúdo do site + gestão de usuários.</summary>
    Master = 1
}

/// <summary>Usuário do painel administrativo. Não há cadastro público.</summary>
public class UsuarioAdmin
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public UsuarioAdminRole Role { get; set; } = UsuarioAdminRole.Admin;
    public bool Ativo { get; set; } = true;
    public DateTimeOffset? UltimoLoginEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
}
