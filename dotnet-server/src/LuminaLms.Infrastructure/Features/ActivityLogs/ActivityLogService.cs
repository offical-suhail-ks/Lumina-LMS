using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.ActivityLogs;

public class ActivityLogService : IActivityLogService
{
    private readonly LmsDbContext _db;

    public ActivityLogService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task LogActivityAsync(LogActivityRequest request, CancellationToken ct = default)
    {
        var log = new ActivityLog
        {
            Id = $"log-{Guid.NewGuid()}",
            UserId = request.UserId,
            UserType = request.UserType.ToEnum<Domain.Enums.OwnerType>(),
            Action = request.Action,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            IpAddress = request.IpAddress,
            UserAgent = request.UserAgent,
            CreatedAt = DateTime.UtcNow,
        };
        _db.ActivityLogs.Add(log);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<ActivityLogDto>> GetActivityLogsAsync(ActivityLogFilter filter, CancellationToken ct = default)
    {
        var query = _db.ActivityLogs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.UserId)) query = query.Where(l => l.UserId == filter.UserId);
        if (filter.UserType.TryToEnum<Domain.Enums.OwnerType>(out var userType)) query = query.Where(l => l.UserType == userType);
        if (!string.IsNullOrWhiteSpace(filter.Action)) query = query.Where(l => l.Action == filter.Action);
        if (!string.IsNullOrWhiteSpace(filter.EntityType)) query = query.Where(l => l.EntityType == filter.EntityType);
        if (filter.StartDate is { } start) query = query.Where(l => l.CreatedAt >= start);
        if (filter.EndDate is { } end) query = query.Where(l => l.CreatedAt <= end);

        query = query.OrderByDescending(l => l.CreatedAt);
        if (filter.Limit is > 0) query = query.Take(filter.Limit.Value);

        var logs = await query.ToListAsync(ct);
        return logs.Select(ToDto).ToList();
    }

    private static ActivityLogDto ToDto(ActivityLog l) => new(l.Id, l.UserId, l.UserType.ToSnakeCase(), l.Action, l.EntityType, l.EntityId, l.Description, l.IpAddress, l.UserAgent, l.CreatedAt);
}
