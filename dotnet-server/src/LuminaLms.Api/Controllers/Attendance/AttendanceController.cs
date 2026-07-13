using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendance;

    public AttendanceController(IAttendanceService attendance)
    {
        _attendance = attendance;
    }

    [HttpGet("department-students")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<IReadOnlyList<DepartmentStudentDto>>> GetDepartmentStudents([FromQuery] string? facultyId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(facultyId))
        {
            return BadRequest(new { message = "Faculty ID is required" });
        }
        return Ok(await _attendance.GetDepartmentStudentsAsync(facultyId, ct));
    }

    [HttpGet]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<IReadOnlyList<AttendanceDto>>> GetByDate([FromQuery] DateOnly? date, [FromQuery] string? facultyId, CancellationToken ct)
        => Ok(await _attendance.GetAttendanceByDateAsync(date ?? DateOnly.FromDateTime(DateTime.UtcNow), facultyId, ct));

    [HttpPost]
    [Authorize(Roles = "admin,faculty")]
    public async Task<IActionResult> Mark([FromBody] MarkAttendanceRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.FacultyId))
        {
            return BadRequest(new { message = "Faculty ID and attendance date are required" });
        }

        if (request.AttendanceList is { Count: > 0 })
        {
            var results = await _attendance.MarkBulkAttendanceAsync(request.AttendanceList, request.FacultyId, request.AttendanceDate, ct);
            return StatusCode(201, results);
        }

        if (string.IsNullOrWhiteSpace(request.StudentId) || string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { message = "Student ID and status are required" });
        }

        var attendance = await _attendance.MarkAttendanceAsync(request.StudentId, request.FacultyId, request.AttendanceDate, request.Status, request.Notes, ct);
        return StatusCode(201, attendance);
    }

    [HttpGet("student/{studentId}/summary")]
    public async Task<ActionResult<AttendanceSummaryDto>> GetSummary(string studentId, CancellationToken ct)
        => Ok(await _attendance.GetStudentAttendanceSummaryAsync(studentId, ct));

    [HttpGet("all")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<IReadOnlyList<AttendanceDto>>> GetAll([FromQuery] AttendanceFilter filter, CancellationToken ct)
        => Ok(await _attendance.GetAllAttendanceAsync(filter, ct));
}
