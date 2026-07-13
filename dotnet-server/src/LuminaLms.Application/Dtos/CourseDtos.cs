namespace LuminaLms.Application.Dtos;

public record CourseDto(
    string Id, string Title, string? Description, string Instructor, string? Department,
    DateOnly? StartDate, DateOnly? EndDate, int? TotalYears, int Capacity,
    IReadOnlyList<string> Tags, IReadOnlyList<string> Enrolled,
    DateTime CreatedAt, DateTime UpdatedAt);

public class CreateCourseRequest
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string Instructor { get; set; } = default!;
    public string? Department { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? TotalYears { get; set; }
    public int Capacity { get; set; } = 30;
    public List<string>? Tags { get; set; }
    public List<string>? Enrolled { get; set; }
}

public record StudentCourseDto(
    string CourseId, DateTime EnrolledAt, string Id, string Title, string? Description, string Instructor,
    string? Department, DateOnly? StartDate, DateOnly? EndDate, int? TotalYears, int Capacity,
    IReadOnlyList<string> Tags, DateTime CreatedAt, DateTime UpdatedAt);
