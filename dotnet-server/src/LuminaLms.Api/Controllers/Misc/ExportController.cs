using System.Text;
using LuminaLms.Api.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("export")]
[Authorize(Roles = "admin")]
public class ExportController : ControllerBase
{
    private readonly IStudentService _students;
    private readonly ICourseService _courses;

    public ExportController(IStudentService students, ICourseService courses)
    {
        _students = students;
        _courses = courses;
    }

    [HttpGet("students")]
    public async Task<IActionResult> ExportStudents(CancellationToken ct)
    {
        var students = await _students.GetAllAsync(ct);
        var csv = CsvWriter.Write(students);
        return File(Encoding.UTF8.GetBytes(csv), "text/csv", "students.csv");
    }

    [HttpGet("courses")]
    public async Task<IActionResult> ExportCourses(CancellationToken ct)
    {
        var courses = await _courses.GetAllAsync(ct);
        var csv = CsvWriter.Write(courses);
        return File(Encoding.UTF8.GetBytes(csv), "text/csv", "courses.csv");
    }
}
