using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.Assignments;

public class AssignmentService : IAssignmentService
{
    private readonly LmsDbContext _db;

    public AssignmentService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<AssignmentDto>> GetAllAsync(CancellationToken ct = default)
    {
        var assignments = await _db.Assignments.Include(a => a.Submissions)
            .OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
        return assignments.Select(ToDto).ToList();
    }

    public async Task<AssignmentDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var assignment = await _db.Assignments.Include(a => a.Submissions).FirstOrDefaultAsync(a => a.Id == id, ct);
        return assignment is null ? null : ToDto(assignment);
    }

    public async Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, CancellationToken ct = default)
    {
        var assignment = new Assignment
        {
            Id = $"assignment-{Guid.NewGuid()}",
            Title = request.Title,
            CourseId = request.CourseId,
            DueDate = request.DueDate,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Assignments.Add(assignment);
        await _db.SaveChangesAsync(ct);
        return ToDto(assignment);
    }

    public async Task<AssignmentDto?> UpdateAsync(string id, UpdateAssignmentRequest request, CancellationToken ct = default)
    {
        var assignment = await _db.Assignments.Include(a => a.Submissions).FirstOrDefaultAsync(a => a.Id == id, ct);
        if (assignment is null) return null;

        if (request.Title is not null) assignment.Title = request.Title;
        if (request.CourseId is not null) assignment.CourseId = request.CourseId;
        assignment.Description = request.Description;
        assignment.DueDate = request.DueDate;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(assignment);
    }

    public async Task<AssignmentSubmissionDto?> SubmitAsync(string assignmentId, SubmitAssignmentRequest request, string? artifactName, CancellationToken ct = default)
    {
        if (!await _db.Assignments.AnyAsync(a => a.Id == assignmentId, ct)) return null;

        var submission = new AssignmentSubmission
        {
            Id = $"submission-{Guid.NewGuid()}",
            AssignmentId = assignmentId,
            StudentId = request.StudentId,
            Notes = request.Notes,
            ArtifactName = artifactName,
            SubmittedAt = DateTime.UtcNow,
        };
        _db.AssignmentSubmissions.Add(submission);
        await _db.SaveChangesAsync(ct);
        return ToDto(submission);
    }

    public async Task<AssignmentSubmissionDto?> GradeSubmissionAsync(string submissionId, GradeSubmissionRequest request, CancellationToken ct = default)
    {
        var submission = await _db.AssignmentSubmissions.FirstOrDefaultAsync(s => s.Id == submissionId, ct);
        if (submission is null) return null;

        submission.Grade = request.Grade;
        submission.Feedback = request.Feedback;
        submission.GradedBy = request.GradedBy;
        submission.GradedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(submission);
    }

    private static AssignmentSubmissionDto ToDto(AssignmentSubmission s) => new(
        s.Id, s.AssignmentId, s.StudentId, s.Notes, s.ArtifactName, s.Grade, s.Feedback, s.GradedAt, s.GradedBy, s.SubmittedAt);

    private static AssignmentDto ToDto(Assignment a) => new(
        a.Id, a.Title, a.CourseId, a.Description, a.DueDate,
        a.Submissions.Select(ToDto).ToList(), a.CreatedAt, a.UpdatedAt);
}
