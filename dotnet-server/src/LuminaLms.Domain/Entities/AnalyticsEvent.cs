using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class AnalyticsEvent
{
    public string Id { get; set; } = default!;
    public string EventType { get; set; } = default!;
    public string? UserId { get; set; }
    public OwnerType? UserType { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    /// <summary>JSON payload, kept as text to match source.</summary>
    public string? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
}
