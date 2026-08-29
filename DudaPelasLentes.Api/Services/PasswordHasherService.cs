using DudaPelasLentes.Api.Entities;
using Microsoft.AspNetCore.Identity;

namespace DudaPelasLentes.Api.Services;

public interface IPasswordHasherService
{
    string Hash(string password);
    bool Verify(string hash, string password);
}

/// <summary>Wrapper sobre o PasswordHasher do ASP.NET Core (PBKDF2, iterações atuais).</summary>
public sealed class PasswordHasherService : IPasswordHasherService
{
    private readonly PasswordHasher<UsuarioAdmin> _hasher = new();
    private static readonly UsuarioAdmin Dummy = new();

    public string Hash(string password) => _hasher.HashPassword(Dummy, password);

    public bool Verify(string hash, string password)
    {
        var result = _hasher.VerifyHashedPassword(Dummy, hash, password);
        return result is PasswordVerificationResult.Success
            or PasswordVerificationResult.SuccessRehashNeeded;
    }
}
