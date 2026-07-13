namespace LuminaLms.Application.Dtos;

public class TrackEventRequest
{
    public string EventType { get; set; } = default!;
    public string? UserId { get; set; }
    public string? UserType { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public object? Metadata { get; set; }
}

public record AssignmentGradeEntry(string Id, string Title, string CourseId, decimal? Grade, DateTime SubmittedAt);
public record QuizScoreEntry(string Id, string Title, string CourseId, decimal? Score, decimal? Percentage, bool? Passed, DateTime? SubmittedAt);

public record StudentPerformanceDto(
    IReadOnlyList<AssignmentGradeEntry> AssignmentGrades, IReadOnlyList<QuizScoreEntry> QuizScores,
    decimal AssignmentAverage, decimal QuizAverage, decimal OverallAverage);

public record AssignmentStatsDto(int TotalAssignments, int TotalSubmissions, int GradedSubmissions);
public record QuizStatsDto(int TotalQuizzes, int TotalAttempts, decimal? AverageScore);
public record CourseAnalyticsDto(int EnrollmentCount, AssignmentStatsDto AssignmentStats, QuizStatsDto QuizStats);

public record RecentActivityEntry(string EventType, int Count, DateOnly Date);
public record SystemAnalyticsDto(int StudentCount, int CourseCount, int AssignmentCount, int SubmissionCount, IReadOnlyList<RecentActivityEntry> RecentActivity);
