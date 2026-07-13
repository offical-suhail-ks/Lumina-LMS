using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface ICalendarService
{
    Task<IReadOnlyList<CalendarEventDto>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<CalendarEventDto>> GetByDateAsync(DateOnly date, CancellationToken ct = default);
    Task<CalendarEventDto> CreateAsync(CreateCalendarEventRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);
}
