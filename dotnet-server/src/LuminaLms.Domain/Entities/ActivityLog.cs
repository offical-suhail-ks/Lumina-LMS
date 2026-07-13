using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class ActivityLog
{
    public string Id { get; set; } = default!;
    public string UserId { get; set; } = default!;
    public OwnerType UserType { get; set; }
    public string Action { get; set; } = default!;
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }
}
