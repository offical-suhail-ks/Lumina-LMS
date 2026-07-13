using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.Calendar;

public class CalendarService : ICalendarService
{
    private readonly LmsDbContext _db;

    public CalendarService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CalendarEventDto>> GetAllAsync(CancellationToken ct = default)
    {
        var events = await _db.CalendarEvents.OrderBy(e => e.EventDate).ThenBy(e => e.EventTime).ToListAsync(ct);
        return events.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<CalendarEventDto>> GetByDateAsync(DateOnly date, CancellationToken ct = default)
    {
        var events = await _db.CalendarEvents.Where(e => e.EventDate == date).OrderBy(e => e.EventTime).ToListAsync(ct);
        return events.Select(ToDto).ToList();
    }

    public async Task<CalendarEventDto> CreateAsync(CreateCalendarEventRequest request, CancellationToken ct = default)
    {
        var evt = new CalendarEvent
        {
            Id = $"event-{Guid.NewGuid()}",
            Title = request.Title,
            Description = request.Description,
            EventDate = request.EventDate,
            EventTime = request.EventTime,
            AssignmentId = request.AssignmentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.CalendarEvents.Add(evt);
        await _db.SaveChangesAsync(ct);
        return ToDto(evt);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await _db.CalendarEvents.Where(e => e.Id == id).ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    private static CalendarEventDto ToDto(CalendarEvent e) => new(e.Id, e.Title, e.Description, e.EventDate, e.EventTime, e.AssignmentId, e.CreatedAt, e.UpdatedAt);
}
