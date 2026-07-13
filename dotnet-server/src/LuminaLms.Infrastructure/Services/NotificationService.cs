using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly LmsDbContext _db;

    public NotificationService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<NotificationDto> CreateAsync(CreateNotificationRequest request, CancellationToken ct = default)
    {
        var notification = new Notification
        {
            Id = $"notif-{Guid.NewGuid()}",
            UserId = request.UserId,
            UserType = request.UserType.ToEnum<OwnerType>(),
            Title = request.Title,
            Message = request.Message,
            Type = request.Type.ToEnum<NotificationType>(),
            Link = request.Link,
            CreatedAt = DateTime.UtcNow,
        };
        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(ct);
        return ToDto(notification);
    }

    public async Task<IReadOnlyList<NotificationDto>> GetByUserAsync(string userId, string userType, bool unreadOnly, int? limit, CancellationToken ct = default)
    {
        var userTypeEnum = userType.ToEnum<OwnerType>();
        var query = _db.Notifications.Where(n => n.UserId == userId && n.UserType == userTypeEnum);
        if (unreadOnly) query = query.Where(n => !n.IsRead);
        query = query.OrderByDescending(n => n.CreatedAt);
        if (limit is { } l) query = query.Take(l);

        var notifications = await query.ToListAsync(ct);
        return notifications.Select(ToDto).ToList();
    }

    public async Task<int> GetUnreadCountAsync(string userId, string userType, CancellationToken ct = default)
    {
        var userTypeEnum = userType.ToEnum<OwnerType>();
        return await _db.Notifications.CountAsync(n => n.UserId == userId && n.UserType == userTypeEnum && !n.IsRead, ct);
    }

    public async Task<NotificationDto?> MarkAsReadAsync(string id, CancellationToken ct = default)
    {
        var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);
        if (notification is null) return null;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ToDto(notification);
    }

    public async Task MarkAllAsReadAsync(string userId, string userType, CancellationToken ct = default)
    {
        var userTypeEnum = userType.ToEnum<OwnerType>();
        await _db.Notifications.Where(n => n.UserId == userId && n.UserType == userTypeEnum && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true).SetProperty(n => n.ReadAt, DateTime.UtcNow), ct);
    }

    private static NotificationDto ToDto(Notification n) => new(
        n.Id, n.UserId, n.UserType.ToSnakeCase(), n.Title, n.Message, n.Type.ToSnakeCase(), n.Link, n.IsRead, n.ReadAt, n.CreatedAt);
}
