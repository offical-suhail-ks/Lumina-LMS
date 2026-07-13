namespace LuminaLms.Domain.Entities;

public class Course
{
    public string Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string Instructor { get; set; } = default!;
    public string? Department { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? TotalYears { get; set; }
    public int Capacity { get; set; } = 30;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
    public ICollection<CourseTag> Tags { get; set; } = new List<CourseTag>();
    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}

public class CourseModule
{
    public string Id { get; set; } = default!;
    public string CourseId { get; set; } = default!;
    public Course? Course { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public decimal? DurationHours { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ModuleMaterial> Materials { get; set; } = new List<ModuleMaterial>();
}

public class ModuleMaterial
{
    public string Id { get; set; } = default!;
    public string ModuleId { get; set; } = default!;
    public CourseModule? Module { get; set; }
    public string Title { get; set; } = default!;
    public string? FileName { get; set; }
    public string? FilePath { get; set; }
    public long? FileSize { get; set; }
    public string? FileType { get; set; }
    public string? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CourseTag
{
    public int Id { get; set; }
    public string CourseId { get; set; } = default!;
    public Course? Course { get; set; }
    public string Tag { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}

public class CourseEnrollment
{
    public int Id { get; set; }
    public string CourseId { get; set; } = default!;
    public Course? Course { get; set; }
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public DateTime EnrolledAt { get; set; }
}
