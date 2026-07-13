namespace LuminaLms.Application.Features.Attendance;

public record DepartmentStudentDto(string Id, string FirstName, string LastName, string Email, string? CourseId, string? BatchTiming, string? ClassSchedule, string Status, string? CourseTitle, string? Department);

public record AttendanceDto(
    string Id, string StudentId, string FacultyId, DateOnly AttendanceDate, string Status, string? Notes, DateTime MarkedAt,
    string? FirstName, string? LastName, string? Email, string? BatchTiming, string? ClassSchedule, string? FacultyName,
    string? CourseTitle = null, string? Department = null);

public class MarkAttendanceRequest
{
    public string? StudentId { get; set; }
    public string FacultyId { get; set; } = default!;
    public DateOnly AttendanceDate { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public List<BulkAttendanceItem>? AttendanceList { get; set; }
}

public class BulkAttendanceItem
{
    public string StudentId { get; set; } = default!;
    public string Status { get; set; } = default!;
    public string? Notes { get; set; }
}

public record AttendancePeriodSummary(int ExpectedClasses, int TotalClasses, int Present, int Absent, int Late, int Excused, double AttendancePercentage);

public record AttendanceSummaryDto(AttendancePeriodSummary Monthly, AttendancePeriodSummary AllTime,
    int TotalClasses, int Present, int Absent, int Late, int Excused, double AttendancePercentage);

public class AttendanceFilter
{
    public string? StudentId { get; set; }
    public string? FacultyId { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Status { get; set; }
}
