using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("calendar")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendar;

    public CalendarController(ICalendarService calendar)
    {
        _calendar = calendar;
    }

    [HttpGet("events")]
    public async Task<ActionResult<IReadOnlyList<CalendarEventDto>>> GetAll(CancellationToken ct)
        => Ok(await _calendar.GetAllAsync(ct));

    [HttpGet("events/{date}")]
    public async Task<ActionResult<IReadOnlyList<CalendarEventDto>>> GetByDate(DateOnly date, CancellationToken ct)
        => Ok(await _calendar.GetByDateAsync(date, ct));

    [HttpPost("events")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CalendarEventDto>> Create([FromBody] CreateCalendarEventRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Title and event date are required" });
        }
        var evt = await _calendar.CreateAsync(request, ct);
        return StatusCode(201, evt);
    }

    [HttpDelete("events/{id}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _calendar.DeleteAsync(id, ct);
        return deleted ? Ok(new { message = "Event deleted successfully" }) : NotFound(new { message = "Event not found" });
    }
}
