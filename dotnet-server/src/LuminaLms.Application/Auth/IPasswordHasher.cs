namespace LuminaLms.Application.Auth;

public interface IPasswordHasher
{
    /// <summary>Always produces a bcrypt hash for new/changed passwords.</summary>
    string Hash(string plainPassword);

    /// <summary>
    /// Verifies a candidate password against a stored value. The source app stored
    /// passwords as plain text, so during migration a stored value may be either a
    /// bcrypt hash (starts with $2) or legacy plain text. When a legacy match
    /// succeeds, <paramref name="rehashed"/> is returned so the caller can persist
    /// it, lazily upgrading the row to a bcrypt hash on next successful login.
    /// </summary>
    bool Verify(string candidate, string storedValue, out string? rehashed);
}
