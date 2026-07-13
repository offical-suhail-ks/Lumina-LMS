namespace LuminaLms.Application.Auth;

public record AuthResult(string Token, string Id, string Name, string Email, string Role, string UserType);

public interface IAuthService
{
    /// <summary>
    /// Tries `identifier` as a staff username first (users table), then as a
    /// student email (students table), mirroring the source authService.login
    /// fallback order. Returns null on no match / bad password.
    /// </summary>
    Task<AuthResult?> LoginAsync(string identifier, string password, CancellationToken ct = default);
}
