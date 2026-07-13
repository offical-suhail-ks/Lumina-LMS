namespace LuminaLms.Application.Auth;

public class LoginRequest
{
    public string? Identifier { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = default!;

    public string? ResolveIdentifier() => Identifier ?? Username ?? Email;
}

public record UserSummaryDto(string Id, string Name, string Role, string Email);

public record LoginResponse(string Token, UserSummaryDto User);
