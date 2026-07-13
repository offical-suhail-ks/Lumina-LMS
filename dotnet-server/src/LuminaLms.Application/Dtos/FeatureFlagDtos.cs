namespace LuminaLms.Application.Dtos;

public record FeatureFlagDto(string Id, string FeatureKey, string FeatureName, string? Description, bool IsEnabled, List<string>? RoleRestrictions, DateTime CreatedAt, DateTime UpdatedAt);

public class CreateFeatureFlagRequest
{
    public string FeatureKey { get; set; } = default!;
    public string FeatureName { get; set; } = default!;
    public string? Description { get; set; }
    public bool? IsEnabled { get; set; }
    public List<string>? RoleRestrictions { get; set; }
}

public class UpdateFeatureFlagRequest
{
    public string FeatureName { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; }
    public List<string>? RoleRestrictions { get; set; }
}

public class ToggleFeatureFlagRequest
{
    public bool Enabled { get; set; }
}
