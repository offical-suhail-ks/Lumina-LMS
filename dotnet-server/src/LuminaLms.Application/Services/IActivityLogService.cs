using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IActivityLogService
{
    Task LogActivityAsync(LogActivityRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ActivityLogDto>> GetActivityLogsAsync(ActivityLogFilter filter, CancellationToken ct = default);
}
