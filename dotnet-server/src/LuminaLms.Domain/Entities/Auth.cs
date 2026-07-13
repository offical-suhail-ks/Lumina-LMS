using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class PasswordResetToken
{
    public string Id { get; set; } = default!;
    /// <summary>Polymorphic: users.id or students.id, disambiguated by UserType.</summary>
    public string UserId { get; set; } = default!;
    public OwnerType UserType { get; set; }
    public string Token { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; }
}
