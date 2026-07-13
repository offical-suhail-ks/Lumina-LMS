using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Attendance
{
    public string Id { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public string FacultyId { get; set; } = default!;
    public User? Faculty { get; set; }
    public DateOnly AttendanceDate { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Notes { get; set; }
    public DateTime MarkedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ClassSchedule
{
    public string Id { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public ScheduleType ScheduleType { get; set; }
    public BatchTiming BatchTiming { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
