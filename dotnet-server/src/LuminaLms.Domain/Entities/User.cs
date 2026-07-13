using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

/// <summary>
/// Staff-side account: admin, faculty, or accounting. There is no separate
/// Faculty/AccountingUser table in the source schema — both are Users rows
/// filtered by Role.
/// </summary>
public class User
{
    public string Id { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
    public UserRole Role { get; set; }
    public string? Department { get; set; }
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
