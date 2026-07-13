using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IFeatureFlagService
{
    Task<IReadOnlyList<FeatureFlagDto>> GetAllAsync(CancellationToken ct = default);
    /// <summary>Fails open: a flag with no role restrictions, or unparseable restrictions, is treated as visible to everyone.</summary>
    Task<IReadOnlyList<FeatureFlagDto>> GetEnabledForRoleAsync(string role, CancellationToken ct = default);
    Task<bool> IsEnabledAsync(string featureKey, string? role, CancellationToken ct = default);
    Task<bool> ToggleAsync(string featureKey, bool enabled, CancellationToken ct = default);
    Task<bool> UpdateAsync(string id, UpdateFeatureFlagRequest request, CancellationToken ct = default);
    Task<string> CreateAsync(CreateFeatureFlagRequest request, CancellationToken ct = default);
    Task DeleteAsync(string id, CancellationToken ct = default);
}
