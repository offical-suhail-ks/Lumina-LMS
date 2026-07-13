namespace LuminaLms.Application.Dtos;

public record GuardianDto(string? Name, string? Email, string? Phone);

public record StudentDto(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    DateOnly? DateOfBirth,
    string? Address,
    string? City,
    string? State,
    string? Country,
    string? PostalCode,
    string? CourseId,
    string? Year,
    string? Cohort,
    string? BatchTiming,
    string? ClassSchedule,
    string Status,
    string ApplicationStatus,
    decimal? CourseFee,
    string? PaymentPlan,
    string? PaymentPlanDetails,
    DateOnly? FeeDueDate,
    bool SendReminder,
    bool OfferLetterSent,
    DateTime? OfferLetterSentAt,
    GuardianDto? Guardian,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public class CreateStudentRequest
{
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? CourseId { get; set; }
    public string? Year { get; set; }
    public string? Cohort { get; set; }
    public string? BatchTiming { get; set; }
    public string? ClassSchedule { get; set; }
    public GuardianDto? Guardian { get; set; }
    public string? AdminRemarks { get; set; }
}

