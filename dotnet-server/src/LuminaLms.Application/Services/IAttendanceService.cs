using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IAttendanceService
{
    Task<IReadOnlyList<DepartmentStudentDto>> GetDepartmentStudentsAsync(string facultyId, CancellationToken ct = default);
    Task<IReadOnlyList<AttendanceDto>> GetAttendanceByDateAsync(DateOnly date, string? facultyId, CancellationToken ct = default);
    Task<AttendanceDto> MarkAttendanceAsync(string studentId, string facultyId, DateOnly date, string status, string? notes, CancellationToken ct = default);
    Task<IReadOnlyList<AttendanceDto>> MarkBulkAttendanceAsync(List<BulkAttendanceItem> items, string facultyId, DateOnly date, CancellationToken ct = default);
    Task<AttendanceSummaryDto> GetStudentAttendanceSummaryAsync(string studentId, CancellationToken ct = default);
    Task<IReadOnlyList<AttendanceDto>> GetAllAttendanceAsync(AttendanceFilter filter, CancellationToken ct = default);
}
