namespace LuminaLms.Application.Dtos;

public record AssignmentSubmissionDto(
    string Id, string AssignmentId, string StudentId, string? Notes, string? ArtifactName,
    decimal? Grade, string? Feedback, DateTime? GradedAt, string? GradedBy, DateTime SubmittedAt);

public record AssignmentDto(
    string Id, string Title, string CourseId, string? Description, DateTime? DueDate,
    IReadOnlyList<AssignmentSubmissionDto> Submissions, DateTime CreatedAt, DateTime UpdatedAt);

public class CreateAssignmentRequest
{
    public string Title { get; set; } = default!;
    public string CourseId { get; set; } = default!;
    public DateTime? DueDate { get; set; }
    public string? Description { get; set; }
}

public class UpdateAssignmentRequest
{
    public string? Title { get; set; }
    public string? CourseId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Description { get; set; }
}

public class SubmitAssignmentRequest
{
    public string StudentId { get; set; } = default!;
    public string? Notes { get; set; }
}

public class GradeSubmissionRequest
{
    public decimal Grade { get; set; }
    public string? Feedback { get; set; }
    public string? GradedBy { get; set; }
}
