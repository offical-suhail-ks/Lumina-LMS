using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("feature-flags")]
public class FeatureFlagsController : ControllerBase
{
    private readonly IFeatureFlagService _featureFlags;

    public FeatureFlagsController(IFeatureFlagService featureFlags)
    {
        _featureFlags = featureFlags;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<IReadOnlyList<FeatureFlagDto>>> GetAll(CancellationToken ct)
        => Ok(await _featureFlags.GetAllAsync(ct));

    [HttpGet("enabled/{role}")]
    public async Task<ActionResult<IReadOnlyList<FeatureFlagDto>>> GetEnabledForRole(string role, CancellationToken ct)
        => Ok(await _featureFlags.GetEnabledForRoleAsync(role, ct));

    [HttpGet("check/{featureKey}")]
    public async Task<IActionResult> Check(string featureKey, [FromQuery] string? role, CancellationToken ct)
        => Ok(new { enabled = await _featureFlags.IsEnabledAsync(featureKey, role, ct) });

    [HttpPut("{featureKey}/toggle")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Toggle(string featureKey, [FromBody] ToggleFeatureFlagRequest request, CancellationToken ct)
    {
        var toggled = await _featureFlags.ToggleAsync(featureKey, request.Enabled, ct);
        return toggled
            ? Ok(new { success = true, message = $"Feature {(request.Enabled ? "enabled" : "disabled")} successfully" })
            : NotFound(new { message = "Feature flag not found" });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateFeatureFlagRequest request, CancellationToken ct)
    {
        var updated = await _featureFlags.UpdateAsync(id, request, ct);
        return updated
            ? Ok(new { success = true, message = "Feature flag updated successfully" })
            : NotFound(new { message = "Feature flag not found" });
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateFeatureFlagRequest request, CancellationToken ct)
    {
        var id = await _featureFlags.CreateAsync(request, ct);
        return StatusCode(201, new { success = true, message = "Feature flag created successfully", id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await _featureFlags.DeleteAsync(id, ct);
        return Ok(new { success = true, message = "Feature flag deleted successfully" });
    }
}
