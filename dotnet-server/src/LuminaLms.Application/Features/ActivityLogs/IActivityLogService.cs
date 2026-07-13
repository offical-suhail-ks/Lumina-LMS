
namespace LuminaLms.Application.Features.ActivityLogs;

public interface IActivityLogService
{
    Task LogActivityAsync(LogActivityRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ActivityLogDto>> GetActivityLogsAsync(ActivityLogFilter filter, CancellationToken ct = default);
}
