using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LuminaLms.Application.Auth;
using LuminaLms.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace LuminaLms.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string GenerateToken(AuthenticatedPrincipal principal)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, principal.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, principal.Id),
            new Claim(ClaimTypes.Name, principal.Name),
            new Claim(ClaimTypes.Email, principal.Email),
            new Claim(ClaimTypes.Role, principal.Role),
            new Claim("userType", principal.UserType),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
