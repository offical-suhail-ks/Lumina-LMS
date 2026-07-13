namespace LuminaLms.Application.Dtos;

public record ActivityLogDto(string Id, string UserId, string UserType, string Action, string? EntityType, string? EntityId, string? Description, string? IpAddress, string? UserAgent, DateTime CreatedAt);

public class LogActivityRequest
{
    public string UserId { get; set; } = default!;
    public string UserType { get; set; } = default!;
    public string Action { get; set; } = default!;
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Description { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class ActivityLogFilter
{
    public string? UserId { get; set; }
    public string? UserType { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? Limit { get; set; }
}
