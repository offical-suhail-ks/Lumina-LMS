namespace LuminaLms.Application.Features.Notifications;

public record NotificationDto(string Id, string UserId, string UserType, string Title, string Message, string Type, string? Link, bool IsRead, DateTime? ReadAt, DateTime CreatedAt);

public class CreateNotificationRequest
{
    public string UserId { get; set; } = default!;
    public string UserType { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string Type { get; set; } = "info";
    public string? Link { get; set; }
}
