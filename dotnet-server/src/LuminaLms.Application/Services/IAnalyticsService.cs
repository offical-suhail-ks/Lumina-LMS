using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IAnalyticsService
{
    Task TrackEventAsync(TrackEventRequest request, CancellationToken ct = default);
    Task<StudentPerformanceDto> GetStudentPerformanceAsync(string studentId, CancellationToken ct = default);
    Task<CourseAnalyticsDto> GetCourseAnalyticsAsync(string courseId, CancellationToken ct = default);
    Task<SystemAnalyticsDto> GetSystemAnalyticsAsync(CancellationToken ct = default);
}
