namespace LuminaLms.Application.Dtos;

public record CourseVideoDto(string Id, string CourseId, string? ModuleId, string Title, string? Description, string? VideoUrl, string? VideoType, int? Duration, string? ThumbnailUrl, int OrderIndex, bool IsPreview, DateTime CreatedAt);

public class AddVideoRequest
{
    public string CourseId { get; set; } = default!;
    public string? ModuleId { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoType { get; set; }
    public int? Duration { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int OrderIndex { get; set; }
    public bool IsPreview { get; set; }
}

public record VideoProgressDto(string Id, string VideoId, string StudentId, decimal ProgressPercentage, int WatchedDuration, bool IsCompleted, DateTime? LastWatchedAt);

public class UpdateVideoProgressRequest
{
    public string StudentId { get; set; } = default!;
    public decimal ProgressPercentage { get; set; }
    public int WatchedDuration { get; set; }
    public bool IsCompleted { get; set; }
}
