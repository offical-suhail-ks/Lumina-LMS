using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Student
{
    public string Id { get; set; } = default!;
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    public string? CourseId { get; set; }
    public Course? Course { get; set; }

    public string? Year { get; set; }
    public string? Cohort { get; set; }
    public BatchTiming? BatchTiming { get; set; }
    public ScheduleType? ClassSchedule { get; set; }

    public StudentStatus Status { get; set; } = StudentStatus.Active;
    public ApplicationStatus ApplicationStatus { get; set; } = ApplicationStatus.Pending;

    public decimal? CourseFee { get; set; }
    public PaymentPlanType? PaymentPlan { get; set; }
    public string? PaymentPlanDetails { get; set; }
    public DateOnly? FeeDueDate { get; set; }
    public bool SendReminder { get; set; } = true;

    public bool OfferLetterSent { get; set; }
    public DateTime? OfferLetterSentAt { get; set; }

    public string? GuardianName { get; set; }
    public string? GuardianEmail { get; set; }
    public string? GuardianPhone { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
}
