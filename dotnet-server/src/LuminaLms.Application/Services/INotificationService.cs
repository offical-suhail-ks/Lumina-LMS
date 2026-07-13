using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface INotificationService
{
    Task<NotificationDto> CreateAsync(CreateNotificationRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<NotificationDto>> GetByUserAsync(string userId, string userType, bool unreadOnly, int? limit, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(string userId, string userType, CancellationToken ct = default);
    Task<NotificationDto?> MarkAsReadAsync(string id, CancellationToken ct = default);
    Task MarkAllAsReadAsync(string userId, string userType, CancellationToken ct = default);
}
