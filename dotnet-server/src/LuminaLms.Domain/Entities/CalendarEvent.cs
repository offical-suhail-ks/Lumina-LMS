namespace LuminaLms.Domain.Entities;

public class CalendarEvent
{
    public string Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateOnly EventDate { get; set; }
    public TimeOnly? EventTime { get; set; }
    public string? AssignmentId { get; set; }
    public Assignment? Assignment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
