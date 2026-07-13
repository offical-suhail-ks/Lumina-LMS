using System.Text.Json;
using LuminaLms.Application.Auth;
using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LuminaLms.Infrastructure.Features.Students;

public class StudentService : IStudentService
{
    private readonly LmsDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAccountingService _accountingService;
    private readonly ILogger<StudentService> _logger;

    public StudentService(LmsDbContext db, IPasswordHasher passwordHasher, IAccountingService accountingService, ILogger<StudentService> logger)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _accountingService = accountingService;
        _logger = logger;
    }

    public async Task<IReadOnlyList<StudentDto>> GetAllAsync(CancellationToken ct = default)
    {
        var students = await _db.Students.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
        return students.Select(ToDto).ToList();
    }

    public async Task<StudentDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id, ct);
        return student is null ? null : ToDto(student);
    }

    public async Task<StudentDto> CreateAsync(CreateStudentRequest request, CancellationToken ct = default)
    {
        if (await _db.Students.AnyAsync(s => s.Email == request.Email, ct))
        {
            throw new InvalidOperationException("Student with this email already exists");
        }

        var student = new Student
        {
            Id = $"student-{Guid.NewGuid()}",
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Username = request.Email, // username = email, matching source app's convention
            Password = _passwordHasher.Hash(request.Password),
            Phone = request.Phone,
            DateOfBirth = request.DateOfBirth,
            Address = request.Address,
            City = request.City,
            State = request.State,
            Country = request.Country,
            PostalCode = request.PostalCode,
            CourseId = request.CourseId,
            Year = request.Year,
            Cohort = request.Cohort,
            Status = StudentStatus.Active,
            ApplicationStatus = ApplicationStatus.Pending,
            GuardianName = request.Guardian?.Name,
            GuardianEmail = request.Guardian?.Email,
            GuardianPhone = request.Guardian?.Phone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        if (request.BatchTiming.TryToEnum<BatchTiming>(out var batch)) student.BatchTiming = batch;
        if (request.ClassSchedule.TryToEnum<ScheduleType>(out var schedule)) student.ClassSchedule = schedule;

        _db.Students.Add(student);
        await _db.SaveChangesAsync(ct);

        // Fee-setup accounting task, matching the source app's post-create side effect.
        // Best-effort: a failure here must not fail student creation.
        try
        {
            var course = student.CourseId is null ? null : await _db.Courses.FirstOrDefaultAsync(c => c.Id == student.CourseId, ct);
            await _accountingService.CreateTaskAsync(new CreateAccountingTaskRequest
            {
                StudentId = student.Id,
                TaskType = "fee_setup",
                Priority = "high",
                Title = $"Fee Setup Required: {student.FirstName} {student.LastName}",
                Description = $"New student enrollment requires fee details to be set up. Student: {student.FirstName} {student.LastName} ({student.Email})" + (course is null ? "" : $". Course: {course.Title}"),
                StudentData = new
                {
                    student.Id,
                    student.FirstName,
                    student.LastName,
                    student.Email,
                    Course = course is null ? null : new { course.Id, course.Title },
                },
                AdminRemarks = request.AdminRemarks,
            }, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create fee-setup accounting task for student {StudentId}", student.Id);
        }

        return ToDto(student);
    }

    public async Task<StudentDto?> UpdateAsync(string id, JsonElement patch, CancellationToken ct = default)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (student is null) return null;

        if (patch.GetString("firstName") is { } firstName) student.FirstName = firstName;
        if (patch.GetString("lastName") is { } lastName) student.LastName = lastName;
        if (patch.GetString("email") is { } email) student.Email = email;
        if (patch.GetString("phone") is { } phone) student.Phone = phone;
        if (patch.GetDateOnly("dateOfBirth") is { } dob) student.DateOfBirth = dob;
        if (patch.GetString("address") is { } address) student.Address = address;
        if (patch.GetString("city") is { } city) student.City = city;
        if (patch.GetString("state") is { } state) student.State = state;
        if (patch.GetString("country") is { } country) student.Country = country;
        if (patch.GetString("postalCode") is { } postalCode) student.PostalCode = postalCode;
        if (patch.GetString("courseId") is { } courseId) student.CourseId = courseId;
        if (patch.GetString("year") is { } year) student.Year = year;
        if (patch.GetString("cohort") is { } cohort) student.Cohort = cohort;
        if (patch.GetString("batchTiming").TryToEnum<BatchTiming>(out var batch)) student.BatchTiming = batch;
        if (patch.GetString("classSchedule").TryToEnum<ScheduleType>(out var schedule)) student.ClassSchedule = schedule;
        if (patch.GetString("status").TryToEnum<StudentStatus>(out var status)) student.Status = status;
        if (patch.GetString("applicationStatus").TryToEnum<ApplicationStatus>(out var appStatus)) student.ApplicationStatus = appStatus;

        if (patch.GetObject("guardian") is { } guardian)
        {
            student.GuardianName = guardian.GetString("name");
            student.GuardianEmail = guardian.GetString("email");
            student.GuardianPhone = guardian.GetString("phone");
        }

        // Fee fields: only touched when explicitly present, preserving the source
        // app's guard against wiping fee data on an unrelated partial edit.
        if (patch.Has("courseFee")) student.CourseFee = patch.GetDecimal("courseFee");
        if (patch.Has("paymentPlan") && patch.GetString("paymentPlan").TryToEnum<PaymentPlanType>(out var plan)) student.PaymentPlan = plan;
        if (patch.Has("paymentPlanDetails")) student.PaymentPlanDetails = patch.GetString("paymentPlanDetails");
        if (patch.Has("feeDueDate")) student.FeeDueDate = patch.GetDateOnly("feeDueDate");
        if (patch.GetBool("sendReminder") is { } sendReminder) student.SendReminder = sendReminder;

        student.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ToDto(student);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await _db.Students.Where(s => s.Id == id).ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    private static StudentDto ToDto(Student s) => new(
        s.Id, s.FirstName, s.LastName, s.Email, s.Phone, s.DateOfBirth, s.Address, s.City, s.State, s.Country, s.PostalCode,
        s.CourseId, s.Year, s.Cohort, s.BatchTiming?.ToSnakeCase(), s.ClassSchedule?.ToSnakeCase(),
        s.Status.ToSnakeCase(), s.ApplicationStatus.ToSnakeCase(),
        s.CourseFee, s.PaymentPlan?.ToSnakeCase(), s.PaymentPlanDetails, s.FeeDueDate, s.SendReminder,
        s.OfferLetterSent, s.OfferLetterSentAt,
        s.GuardianName is null ? null : new GuardianDto(s.GuardianName, s.GuardianEmail, s.GuardianPhone),
        s.CreatedAt, s.UpdatedAt);
}
