using LuminaLms.Application.Auth;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly LmsDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(LmsDbContext db, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResult?> LoginAsync(string identifier, string password, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == identifier, ct);
        if (user is not null)
        {
            if (!_passwordHasher.Verify(password, user.Password, out var rehashed))
            {
                return null;
            }

            if (rehashed is not null)
            {
                user.Password = rehashed;
                await _db.SaveChangesAsync(ct);
            }

            var role = user.Role.ToString().ToLowerInvariant();
            var token = _jwtTokenService.GenerateToken(new AuthenticatedPrincipal(user.Id, user.Name, user.Email, role, "user"));
            return new AuthResult(token, user.Id, user.Name, user.Email, role, "user");
        }

        var student = await _db.Students.FirstOrDefaultAsync(s => s.Email == identifier, ct);
        if (student is not null)
        {
            if (!_passwordHasher.Verify(password, student.Password, out var rehashed))
            {
                return null;
            }

            if (rehashed is not null)
            {
                student.Password = rehashed;
                await _db.SaveChangesAsync(ct);
            }

            var name = $"{student.FirstName} {student.LastName}";
            var token = _jwtTokenService.GenerateToken(new AuthenticatedPrincipal(student.Id, name, student.Email, "student", "student"));
            return new AuthResult(token, student.Id, name, student.Email, "student", "student");
        }

        return null;
    }
}
