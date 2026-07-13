using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courses;

    public CoursesController(ICourseService courses)
    {
        _courses = courses;
    }

    [HttpGet("courses")]
    public async Task<ActionResult<IReadOnlyList<CourseDto>>> GetAll(CancellationToken ct)
        => Ok(await _courses.GetAllAsync(ct));

    [HttpGet("courses/{id}")]
    public async Task<ActionResult<CourseDto>> GetById(string id, CancellationToken ct)
    {
        var course = await _courses.GetByIdAsync(id, ct);
        return course is null ? NotFound(new { message = "Course not found" }) : Ok(course);
    }

    [HttpPost("courses")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CourseDto>> Create([FromBody] CreateCourseRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Instructor))
        {
            return BadRequest(new { message = "Title and instructor are required" });
        }
        var course = await _courses.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = course.Id }, course);
    }

    [HttpPut("courses/{id}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CourseDto>> Update(string id, [FromBody] JsonElement patch, CancellationToken ct)
    {
        var course = await _courses.UpdateAsync(id, patch, ct);
        return course is null ? NotFound(new { message = "Course not found" }) : Ok(course);
    }

    [HttpDelete("courses/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _courses.DeleteAsync(id, ct);
        return deleted ? Ok(new { message = "Course deleted successfully" }) : NotFound(new { message = "Course not found" });
    }

    [HttpPost("courses/{courseId}/enroll")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<IActionResult> Enroll(string courseId, [FromBody] JsonElement body, CancellationToken ct)
    {
        var studentId = body.TryGetProperty("studentId", out var el) ? el.GetString() : null;
        if (string.IsNullOrWhiteSpace(studentId))
        {
            return BadRequest(new { message = "studentId is required" });
        }

        var result = await _courses.EnrollAsync(courseId, studentId, ct);
        return result switch
        {
            EnrollResult.CourseNotFound => NotFound(new { message = "Course not found" }),
            EnrollResult.AlreadyEnrolled => Conflict(new { message = "Already enrolled in this course" }),
            EnrollResult.AtCapacity => BadRequest(new { message = "Course is at full capacity" }),
            _ => StatusCode(201, new { message = "Successfully enrolled in course" }),
        };
    }

    [HttpDelete("courses/{courseId}/enroll/{studentId}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<IActionResult> Unenroll(string courseId, string studentId, CancellationToken ct)
    {
        var removed = await _courses.UnenrollAsync(courseId, studentId, ct);
        return removed ? Ok(new { message = "Successfully unenrolled from course" }) : NotFound(new { message = "Enrollment not found" });
    }

    [HttpGet("students/{studentId}/courses")]
    public async Task<ActionResult<IReadOnlyList<StudentCourseDto>>> GetStudentCourses(string studentId, CancellationToken ct)
        => Ok(await _courses.GetStudentCoursesAsync(studentId, ct));
}
