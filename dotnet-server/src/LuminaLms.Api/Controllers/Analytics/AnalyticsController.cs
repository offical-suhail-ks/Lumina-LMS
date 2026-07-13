using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analytics;

    public AnalyticsController(IAnalyticsService analytics)
    {
        _analytics = analytics;
    }

    [HttpPost("events")]
    public async Task<IActionResult> TrackEvent([FromBody] TrackEventRequest request, CancellationToken ct)
    {
        await _analytics.TrackEventAsync(request, ct);
        return Ok(new { success = true });
    }

    [HttpGet("student/{studentId}/performance")]
    public async Task<ActionResult<StudentPerformanceDto>> GetStudentPerformance(string studentId, CancellationToken ct)
        => Ok(await _analytics.GetStudentPerformanceAsync(studentId, ct));

    [HttpGet("course/{courseId}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CourseAnalyticsDto>> GetCourseAnalytics(string courseId, CancellationToken ct)
        => Ok(await _analytics.GetCourseAnalyticsAsync(courseId, ct));

    [HttpGet("system")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<SystemAnalyticsDto>> GetSystemAnalytics(CancellationToken ct)
        => Ok(await _analytics.GetSystemAnalyticsAsync(ct));
}
