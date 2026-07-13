namespace LuminaLms.Domain.Entities;

public class FeatureFlag
{
    public string Id { get; set; } = default!;
    public string FeatureKey { get; set; } = default!;
    public string FeatureName { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; } = true;
    /// <summary>JSON array of role strings this flag is restricted to; null/empty = visible to all roles.</summary>
    public string? RoleRestrictions { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
