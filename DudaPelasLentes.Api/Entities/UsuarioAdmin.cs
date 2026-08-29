namespace DudaPelasLentes.Api.Entities;

/// <summary>Usuário do painel administrativo. Não há cadastro público.</summary>
public class UsuarioAdmin
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public DateTimeOffset? UltimoLoginEm { get; set; }
    public DateTimeOffset CriadoEm { get; set; } = DateTimeOffset.UtcNow;
}
