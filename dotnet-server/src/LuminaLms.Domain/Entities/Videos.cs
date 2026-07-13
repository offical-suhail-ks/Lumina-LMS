using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class CourseVideo
{
    public string Id { get; set; } = default!;
    public string CourseId { get; set; } = default!;
    public string? ModuleId { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public VideoType? VideoType { get; set; }
    public int? Duration { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int OrderIndex { get; set; }
    public bool IsPreview { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VideoProgress
{
    public string Id { get; set; } = default!;
    public string VideoId { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public decimal ProgressPercentage { get; set; }
    public int WatchedDuration { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? LastWatchedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
