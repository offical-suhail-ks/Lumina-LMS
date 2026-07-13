using System.Text.Json;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.FeatureFlags;

public class FeatureFlagService : IFeatureFlagService
{
    private readonly LmsDbContext _db;

    public FeatureFlagService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FeatureFlagDto>> GetAllAsync(CancellationToken ct = default)
    {
        var flags = await _db.FeatureFlags.OrderBy(f => f.FeatureName).ToListAsync(ct);
        return flags.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<FeatureFlagDto>> GetEnabledForRoleAsync(string role, CancellationToken ct = default)
    {
        var flags = await _db.FeatureFlags.Where(f => f.IsEnabled).ToListAsync(ct);
        return flags.Where(f => IsRoleAllowed(f.RoleRestrictions, role)).Select(ToDto).ToList();
    }

    public async Task<bool> IsEnabledAsync(string featureKey, string? role, CancellationToken ct = default)
    {
        var flag = await _db.FeatureFlags.FirstOrDefaultAsync(f => f.FeatureKey == featureKey, ct);
        if (flag is null || !flag.IsEnabled) return false;
        if (role is null) return true;
        return IsRoleAllowed(flag.RoleRestrictions, role);
    }

    public async Task<bool> ToggleAsync(string featureKey, bool enabled, CancellationToken ct = default)
    {
        var rows = await _db.FeatureFlags.Where(f => f.FeatureKey == featureKey)
            .ExecuteUpdateAsync(s => s.SetProperty(f => f.IsEnabled, enabled).SetProperty(f => f.UpdatedAt, DateTime.UtcNow), ct);
        return rows > 0;
    }

    public async Task<bool> UpdateAsync(string id, UpdateFeatureFlagRequest request, CancellationToken ct = default)
    {
        var flag = await _db.FeatureFlags.FirstOrDefaultAsync(f => f.Id == id, ct);
        if (flag is null) return false;

        flag.FeatureName = request.FeatureName;
        flag.Description = request.Description;
        flag.IsEnabled = request.IsEnabled;
        flag.RoleRestrictions = request.RoleRestrictions is null ? null : JsonSerializer.Serialize(request.RoleRestrictions);
        flag.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<string> CreateAsync(CreateFeatureFlagRequest request, CancellationToken ct = default)
    {
        var flag = new FeatureFlag
        {
            Id = Guid.NewGuid().ToString(),
            FeatureKey = request.FeatureKey,
            FeatureName = request.FeatureName,
            Description = request.Description,
            IsEnabled = request.IsEnabled ?? true,
            RoleRestrictions = request.RoleRestrictions is null ? null : JsonSerializer.Serialize(request.RoleRestrictions),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.FeatureFlags.Add(flag);
        await _db.SaveChangesAsync(ct);
        return flag.Id;
    }

    public async Task DeleteAsync(string id, CancellationToken ct = default)
    {
        await _db.FeatureFlags.Where(f => f.Id == id).ExecuteDeleteAsync(ct);
    }

    private static bool IsRoleAllowed(string? roleRestrictionsJson, string role)
    {
        if (string.IsNullOrWhiteSpace(roleRestrictionsJson)) return true;
        try
        {
            var restrictions = JsonSerializer.Deserialize<List<string>>(roleRestrictionsJson);
            return restrictions is null || restrictions.Contains(role);
        }
        catch
        {
            return true;
        }
    }

    private static FeatureFlagDto ToDto(FeatureFlag f) => new(
        f.Id, f.FeatureKey, f.FeatureName, f.Description, f.IsEnabled,
        string.IsNullOrWhiteSpace(f.RoleRestrictions) ? null : JsonSerializer.Deserialize<List<string>>(f.RoleRestrictions),
        f.CreatedAt, f.UpdatedAt);
}
