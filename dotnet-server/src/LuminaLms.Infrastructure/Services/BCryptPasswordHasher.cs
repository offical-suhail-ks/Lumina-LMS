using LuminaLms.Application.Auth;

namespace LuminaLms.Infrastructure.Services;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string plainPassword) => BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 11);

    public bool Verify(string candidate, string storedValue, out string? rehashed)
    {
        rehashed = null;

        var looksHashed = storedValue.StartsWith("$2a") || storedValue.StartsWith("$2b") || storedValue.StartsWith("$2y");
        if (looksHashed)
        {
            return BCrypt.Net.BCrypt.Verify(candidate, storedValue);
        }

        // Legacy plaintext row (pre-migration). Compare directly; on success,
        // upgrade it to a bcrypt hash so this branch is never hit again for this row.
        if (storedValue == candidate)
        {
            rehashed = Hash(candidate);
            return true;
        }

        return false;
    }
}
