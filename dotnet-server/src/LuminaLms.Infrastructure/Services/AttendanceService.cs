using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class AttendanceService : IAttendanceService
{
    private readonly LmsDbContext _db;

    public AttendanceService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<DepartmentStudentDto>> GetDepartmentStudentsAsync(string facultyId, CancellationToken ct = default)
    {
        var faculty = await _db.Users.FirstOrDefaultAsync(u => u.Id == facultyId && u.Role == UserRole.Faculty, ct);
        if (faculty?.Department is null) return [];

        var courseIds = await _db.Courses.Where(c => c.Department == faculty.Department).Select(c => c.Id).ToListAsync(ct);
        if (courseIds.Count == 0) return [];

        var students = await _db.Students
            .Include(s => s.Course)
            .Where(s => s.CourseId != null && courseIds.Contains(s.CourseId!) && s.Status == StudentStatus.Active)
            .OrderBy(s => s.FirstName).ThenBy(s => s.LastName)
            .ToListAsync(ct);

        return students.Select(s => new DepartmentStudentDto(
            s.Id, s.FirstName, s.LastName, s.Email, s.CourseId, s.BatchTiming?.ToSnakeCase(), s.ClassSchedule?.ToSnakeCase(),
            s.Status.ToSnakeCase(), s.Course?.Title, s.Course?.Department)).ToList();
    }

    public async Task<IReadOnlyList<AttendanceDto>> GetAttendanceByDateAsync(DateOnly date, string? facultyId, CancellationToken ct = default)
    {
        var query = _db.Attendance.Include(a => a.Student).Include(a => a.Faculty)
            .Where(a => a.AttendanceDate == date);
        if (!string.IsNullOrWhiteSpace(facultyId)) query = query.Where(a => a.FacultyId == facultyId);

        var records = await query.OrderBy(a => a.Student!.FirstName).ThenBy(a => a.Student!.LastName).ToListAsync(ct);
        return records.Select(ToDto).ToList();
    }

    public async Task<AttendanceDto> MarkAttendanceAsync(string studentId, string facultyId, DateOnly date, string status, string? notes, CancellationToken ct = default)
    {
        var statusEnum = status.ToEnum<AttendanceStatus>();
        var existing = await _db.Attendance.FirstOrDefaultAsync(a => a.StudentId == studentId && a.AttendanceDate == date, ct);

        if (existing is not null)
        {
            existing.Status = statusEnum;
            existing.Notes = notes;
            existing.FacultyId = facultyId;
            existing.MarkedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            existing = new Attendance
            {
                Id = $"attendance-{Guid.NewGuid()}",
                StudentId = studentId,
                FacultyId = facultyId,
                AttendanceDate = date,
                Status = statusEnum,
                Notes = notes,
                MarkedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.Attendance.Add(existing);
        }

        await _db.SaveChangesAsync(ct);
        return (await GetByIdAsync(existing.Id, ct))!;
    }

    public async Task<IReadOnlyList<AttendanceDto>> MarkBulkAttendanceAsync(List<BulkAttendanceItem> items, string facultyId, DateOnly date, CancellationToken ct = default)
    {
        var results = new List<AttendanceDto>();
        foreach (var item in items)
        {
            results.Add(await MarkAttendanceAsync(item.StudentId, facultyId, date, item.Status, item.Notes, ct));
        }
        return results;
    }

    public async Task<AttendanceSummaryDto> GetStudentAttendanceSummaryAsync(string studentId, CancellationToken ct = default)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == studentId, ct);
        var scheduleType = student?.ClassSchedule;

        var now = DateTime.UtcNow;
        var firstDay = new DateOnly(now.Year, now.Month, 1);
        var lastDay = firstDay.AddMonths(1).AddDays(-1);

        var monthly = await SummarizeAsync(studentId, firstDay, lastDay, ct);
        var allTime = await SummarizeAsync(studentId, null, null, ct);

        var expectedClassesThisMonth = scheduleType is { } st ? ScheduleCalculator.ExpectedClassesInMonth(st, now.Year, now.Month) : 0;

        var monthlyPct = expectedClassesThisMonth > 0
            ? (double)(monthly.Present + monthly.Late + monthly.Excused) / expectedClassesThisMonth * 100
            : monthly.TotalClasses > 0
                ? (double)(monthly.Present + monthly.Late + monthly.Excused) / monthly.TotalClasses * 100
                : 0;

        var allTimePct = allTime.TotalClasses > 0
            ? (double)(allTime.Present + allTime.Late + allTime.Excused) / allTime.TotalClasses * 100
            : 0;

        var monthlySummary = new AttendancePeriodSummary(expectedClassesThisMonth, monthly.TotalClasses, monthly.Present, monthly.Absent, monthly.Late, monthly.Excused, Math.Round(monthlyPct, 2));
        var allTimeSummary = new AttendancePeriodSummary(0, allTime.TotalClasses, allTime.Present, allTime.Absent, allTime.Late, allTime.Excused, Math.Round(allTimePct, 2));

        return new AttendanceSummaryDto(monthlySummary, allTimeSummary,
            allTime.TotalClasses, allTime.Present, allTime.Absent, allTime.Late, allTime.Excused, Math.Round(allTimePct, 2));
    }

    public async Task<IReadOnlyList<AttendanceDto>> GetAllAttendanceAsync(AttendanceFilter filter, CancellationToken ct = default)
    {
        var query = _db.Attendance.Include(a => a.Student).ThenInclude(s => s!.Course).Include(a => a.Faculty).AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.StudentId)) query = query.Where(a => a.StudentId == filter.StudentId);
        if (!string.IsNullOrWhiteSpace(filter.FacultyId)) query = query.Where(a => a.FacultyId == filter.FacultyId);
        if (filter.StartDate is { } start) query = query.Where(a => a.AttendanceDate >= start);
        if (filter.EndDate is { } end) query = query.Where(a => a.AttendanceDate <= end);
        if (filter.Status.TryToEnum<AttendanceStatus>(out var statusEnum)) query = query.Where(a => a.Status == statusEnum);

        var records = await query.OrderByDescending(a => a.AttendanceDate)
            .ThenBy(a => a.Student!.FirstName).ThenBy(a => a.Student!.LastName)
            .ToListAsync(ct);

        return records.Select(a => ToDto(a) with { CourseTitle = a.Student?.Course?.Title, Department = a.Student?.Course?.Department }).ToList();
    }

    private async Task<AttendancePeriodSummary> SummarizeAsync(string studentId, DateOnly? start, DateOnly? end, CancellationToken ct)
    {
        var query = _db.Attendance.Where(a => a.StudentId == studentId);
        if (start is { } s) query = query.Where(a => a.AttendanceDate >= s);
        if (end is { } e) query = query.Where(a => a.AttendanceDate <= e);

        var counts = await query.GroupBy(_ => 1).Select(g => new
        {
            Total = g.Count(),
            Present = g.Count(a => a.Status == AttendanceStatus.Present),
            Absent = g.Count(a => a.Status == AttendanceStatus.Absent),
            Late = g.Count(a => a.Status == AttendanceStatus.Late),
            Excused = g.Count(a => a.Status == AttendanceStatus.Excused),
        }).FirstOrDefaultAsync(ct);

        return new AttendancePeriodSummary(0, counts?.Total ?? 0, counts?.Present ?? 0, counts?.Absent ?? 0, counts?.Late ?? 0, counts?.Excused ?? 0, 0);
    }

    private async Task<AttendanceDto?> GetByIdAsync(string id, CancellationToken ct)
    {
        var a = await _db.Attendance.Include(x => x.Student).Include(x => x.Faculty).FirstOrDefaultAsync(x => x.Id == id, ct);
        return a is null ? null : ToDto(a);
    }

    private static AttendanceDto ToDto(Attendance a) => new(
        a.Id, a.StudentId, a.FacultyId, a.AttendanceDate, a.Status.ToSnakeCase(), a.Notes, a.MarkedAt,
        a.Student?.FirstName, a.Student?.LastName, a.Student?.Email, a.Student?.BatchTiming?.ToSnakeCase(), a.Student?.ClassSchedule?.ToSnakeCase(),
        a.Faculty?.Name);
}
