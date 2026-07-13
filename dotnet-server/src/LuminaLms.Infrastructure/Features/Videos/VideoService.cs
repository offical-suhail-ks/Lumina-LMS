using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.Videos;

public class VideoService : IVideoService
{
    private readonly LmsDbContext _db;

    public VideoService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<CourseVideoDto> AddVideoAsync(AddVideoRequest request, CancellationToken ct = default)
    {
        var video = new CourseVideo
        {
            Id = $"video-{Guid.NewGuid()}",
            CourseId = request.CourseId,
            ModuleId = request.ModuleId,
            Title = request.Title,
            Description = request.Description,
            VideoUrl = request.VideoUrl,
            VideoType = request.VideoType.TryToEnum<Domain.Enums.VideoType>(out var vt) ? vt : null,
            Duration = request.Duration,
            ThumbnailUrl = request.ThumbnailUrl,
            OrderIndex = request.OrderIndex,
            IsPreview = request.IsPreview,
            CreatedAt = DateTime.UtcNow,
        };
        _db.CourseVideos.Add(video);
        await _db.SaveChangesAsync(ct);
        return ToDto(video);
    }

    public async Task<IReadOnlyList<CourseVideoDto>> GetByCourseAsync(string courseId, CancellationToken ct = default)
    {
        var videos = await _db.CourseVideos.Where(v => v.CourseId == courseId)
            .OrderBy(v => v.OrderIndex).ThenBy(v => v.CreatedAt).ToListAsync(ct);
        return videos.Select(ToDto).ToList();
    }

    public async Task<VideoProgressDto> UpdateProgressAsync(string videoId, UpdateVideoProgressRequest request, CancellationToken ct = default)
    {
        var existing = await _db.VideoProgress.FirstOrDefaultAsync(p => p.VideoId == videoId && p.StudentId == request.StudentId, ct);

        if (existing is not null)
        {
            existing.ProgressPercentage = request.ProgressPercentage;
            existing.WatchedDuration = request.WatchedDuration;
            existing.IsCompleted = request.IsCompleted;
            existing.LastWatchedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new VideoProgress
            {
                Id = $"vp-{Guid.NewGuid()}",
                VideoId = videoId,
                StudentId = request.StudentId,
                ProgressPercentage = request.ProgressPercentage,
                WatchedDuration = request.WatchedDuration,
                IsCompleted = request.IsCompleted,
                LastWatchedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.VideoProgress.Add(existing);
        }

        await _db.SaveChangesAsync(ct);
        return ToDto(existing);
    }

    public async Task<VideoProgressDto?> GetProgressAsync(string videoId, string studentId, CancellationToken ct = default)
    {
        var progress = await _db.VideoProgress.FirstOrDefaultAsync(p => p.VideoId == videoId && p.StudentId == studentId, ct);
        return progress is null ? null : ToDto(progress);
    }

    private static CourseVideoDto ToDto(CourseVideo v) => new(
        v.Id, v.CourseId, v.ModuleId, v.Title, v.Description, v.VideoUrl, v.VideoType?.ToSnakeCase(),
        v.Duration, v.ThumbnailUrl, v.OrderIndex, v.IsPreview, v.CreatedAt);

    private static VideoProgressDto ToDto(VideoProgress p) => new(p.Id, p.VideoId, p.StudentId, p.ProgressPercentage, p.WatchedDuration, p.IsCompleted, p.LastWatchedAt);
}
