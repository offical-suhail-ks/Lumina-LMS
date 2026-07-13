using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("activity-logs")]
[Authorize]
public class ActivityLogsController : ControllerBase
{
    private readonly IActivityLogService _activityLogs;

    public ActivityLogsController(IActivityLogService activityLogs)
    {
        _activityLogs = activityLogs;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogDto>>> GetAll([FromQuery] ActivityLogFilter filter, CancellationToken ct)
        => Ok(await _activityLogs.GetActivityLogsAsync(filter, ct));

    [HttpPost]
    public async Task<IActionResult> Log([FromBody] LogActivityRequest request, CancellationToken ct)
    {
        await _activityLogs.LogActivityAsync(request, ct);
        return Ok(new { success = true });
    }
}
