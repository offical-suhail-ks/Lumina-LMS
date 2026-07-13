using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignments;
    private readonly IFileStorageService _fileStorage;

    public AssignmentsController(IAssignmentService assignments, IFileStorageService fileStorage)
    {
        _assignments = assignments;
        _fileStorage = fileStorage;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AssignmentDto>>> GetAll(CancellationToken ct)
        => Ok(await _assignments.GetAllAsync(ct));

    [HttpPost]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<AssignmentDto>> Create([FromBody] CreateAssignmentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.CourseId))
        {
            return BadRequest(new { message = "Title and courseId are required" });
        }
        var assignment = await _assignments.CreateAsync(request, ct);
        return StatusCode(201, assignment);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<AssignmentDto>> Update(string id, [FromBody] UpdateAssignmentRequest request, CancellationToken ct)
    {
        var assignment = await _assignments.UpdateAsync(id, request, ct);
        return assignment is null ? NotFound(new { message = "Assignment not found" }) : Ok(assignment);
    }

    [HttpPost("{id}/submit")]
    [Authorize(Roles = "student")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<AssignmentSubmissionDto>> Submit(string id, [FromForm] SubmitAssignmentRequest request, IFormFile? file, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.StudentId))
        {
            return BadRequest(new { message = "Missing studentId" });
        }

        string? artifactName = null;
        if (file is not null)
        {
            await using var stream = file.OpenReadStream();
            await _fileStorage.SaveModuleFileAsync(stream, file.FileName, file.ContentType, ct);
            artifactName = file.FileName;
        }

        var submission = await _assignments.SubmitAsync(id, request, artifactName, ct);
        return submission is null ? NotFound(new { message = "Assignment not found" }) : StatusCode(201, submission);
    }

    [HttpPost("submissions/{id}/grade")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<AssignmentSubmissionDto>> GradeSubmission(string id, [FromBody] GradeSubmissionRequest request, CancellationToken ct)
    {
        var submission = await _assignments.GradeSubmissionAsync(id, request, ct);
        return submission is null ? NotFound(new { message = "Submission not found" }) : Ok(submission);
    }
}
