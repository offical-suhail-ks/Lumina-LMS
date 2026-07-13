using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Notification
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public OwnerType UserType { get; set; }
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
