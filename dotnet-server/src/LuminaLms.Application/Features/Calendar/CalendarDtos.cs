namespace LuminaLms.Application.Features.Calendar;

public record CalendarEventDto(string Id, string Title, string? Description, DateOnly EventDate, TimeOnly? EventTime, string? AssignmentId, DateTime CreatedAt, DateTime UpdatedAt);

public class CreateCalendarEventRequest
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateOnly EventDate { get; set; }
    public TimeOnly? EventTime { get; set; }
    public string? AssignmentId { get; set; }
}
