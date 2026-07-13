namespace LuminaLms.Domain.Entities;

public class Assignment
{
    public string Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string CourseId { get; set; } = default!;
    public Course? Course { get; set; }
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
}

public class AssignmentSubmission
{
    public string Id { get; set; } = default!;
    public string AssignmentId { get; set; } = default!;
    public Assignment? Assignment { get; set; }
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public string? Notes { get; set; }
    public string? ArtifactName { get; set; }
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAt { get; set; }
    public string? GradedBy { get; set; }
    public DateTime SubmittedAt { get; set; }
}
