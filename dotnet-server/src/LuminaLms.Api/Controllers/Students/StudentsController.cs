using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("students")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _students;

    public StudentsController(IStudentService students)
    {
        _students = students;
    }

    [HttpGet]
    [Authorize(Roles = "admin,faculty,accounting")]
    public async Task<ActionResult<IReadOnlyList<StudentDto>>> GetAll(CancellationToken ct)
        => Ok(await _students.GetAllAsync(ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentDto>> GetById(string id, CancellationToken ct)
    {
        var student = await _students.GetByIdAsync(id, ct);
        return student is null ? NotFound(new { message = "Student not found" }) : Ok(student);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<StudentDto>> Create([FromBody] CreateStudentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Missing required fields" });
        }
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Password is required" });
        }

        try
        {
            var student = await _students.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = student.Id }, student);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,faculty,accounting")]
    public async Task<ActionResult<StudentDto>> Update(string id, [FromBody] JsonElement patch, CancellationToken ct)
    {
        var student = await _students.UpdateAsync(id, patch, ct);
        return student is null ? NotFound(new { message = "Student not found" }) : Ok(student);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _students.DeleteAsync(id, ct);
        return deleted ? NoContent() : NotFound(new { message = "Student not found" });
    }
}
