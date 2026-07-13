namespace LuminaLms.Application.Auth;

public record AuthenticatedPrincipal(string Id, string Name, string Email, string Role, string UserType);

public interface IJwtTokenService
{
    string GenerateToken(AuthenticatedPrincipal principal);
}
