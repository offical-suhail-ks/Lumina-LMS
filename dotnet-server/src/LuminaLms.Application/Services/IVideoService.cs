using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IVideoService
{
    Task<CourseVideoDto> AddVideoAsync(AddVideoRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<CourseVideoDto>> GetByCourseAsync(string courseId, CancellationToken ct = default);
    Task<VideoProgressDto> UpdateProgressAsync(string videoId, UpdateVideoProgressRequest request, CancellationToken ct = default);
    Task<VideoProgressDto?> GetProgressAsync(string videoId, string studentId, CancellationToken ct = default);
}
