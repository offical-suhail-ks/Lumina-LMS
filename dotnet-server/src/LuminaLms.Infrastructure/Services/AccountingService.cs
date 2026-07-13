using System.Text.Json;
using LuminaLms.Application.Auth;
using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Options;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LuminaLms.Infrastructure.Services;

public class AccountingService : IAccountingService
{
    private readonly LmsDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly SmtpOptions _smtpOptions;
    private readonly ILogger<AccountingService> _logger;

    public AccountingService(LmsDbContext db, IEmailSender emailSender, IOptions<SmtpOptions> smtpOptions, ILogger<AccountingService> logger)
    {
        _db = db;
        _emailSender = emailSender;
        _smtpOptions = smtpOptions.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<AccountingTaskDto>> GetAllTasksAsync(string? status, string? assignedTo, string? taskType, CancellationToken ct = default)
    {
        var query = _db.AccountingTasks.Include(t => t.Student).Include(t => t.AssignedToUser).AsQueryable();

        if (status.TryToEnum<AccountingTaskStatus>(out var statusEnum)) query = query.Where(t => t.Status == statusEnum);
        if (!string.IsNullOrWhiteSpace(assignedTo)) query = query.Where(t => t.AssignedTo == assignedTo);
        if (taskType.TryToEnum<AccountingTaskType>(out var typeEnum)) query = query.Where(t => t.TaskType == typeEnum);

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync(ct);
        return tasks.Select(ToDto).ToList();
    }

    public async Task<AccountingTaskDto?> GetTaskByIdAsync(string id, CancellationToken ct = default)
    {
        var task = await _db.AccountingTasks.Include(t => t.Student).Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        return task is null ? null : ToDto(task);
    }

    public async Task<AccountingTaskDto> CreateTaskAsync(CreateAccountingTaskRequest request, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == request.StudentId, ct)
            ?? throw new KeyNotFoundException("Student not found");
        student.ApplicationStatus = ApplicationStatus.FeeSetupPending;

        var task = new AccountingTask
        {
            Id = $"task-{Guid.NewGuid()}",
            StudentId = request.StudentId,
            TaskType = request.TaskType.ToEnum<AccountingTaskType>(),
            Status = AccountingTaskStatus.Pending,
            Priority = request.Priority.ToEnum<Priority>(),
            Title = request.Title,
            Description = request.Description,
            StudentData = Serialize(request.StudentData),
            FeeDetails = Serialize(request.FeeDetails),
            AdminRemarks = request.AdminRemarks,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.AccountingTasks.Add(task);
        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return (await GetTaskByIdAsync(task.Id, ct))!;
    }

    public async Task<AccountingTaskDto?> UpdateTaskAsync(string id, JsonElement patch, CancellationToken ct = default)
    {
        var task = await _db.AccountingTasks.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task is null) return null;

        if (patch.GetString("status") is { } status && status.TryToEnum<AccountingTaskStatus>(out var statusEnum))
        {
            task.Status = statusEnum;
            if (statusEnum == AccountingTaskStatus.Completed)
            {
                task.CompletedAt = DateTime.UtcNow;
                if (patch.GetString("completedBy") is { } completedBy) task.CompletedBy = completedBy;
            }
        }
        if (patch.GetString("priority") is { } priority && priority.TryToEnum<Priority>(out var prEnum)) task.Priority = prEnum;
        if (patch.GetString("assignedTo") is { } assignedTo) task.AssignedTo = assignedTo;
        if (patch.GetString("notes") is { } notes) task.Notes = notes;
        if (patch.GetString("adminRemarks") is { } adminRemarks) task.AdminRemarks = adminRemarks;
        if (patch.GetString("accountingRemarks") is { } accountingRemarks) task.AccountingRemarks = accountingRemarks;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetTaskByIdAsync(id, ct);
    }

    public async Task<AccountingTaskDto?> CompleteTaskAsync(string id, CompleteAccountingTaskRequest request, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var task = await _db.AccountingTasks.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task is null) return null;

        if (request.FeeDetails is { } fee)
        {
            var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == task.StudentId, ct);
            if (student is not null)
            {
                student.CourseFee = fee.CourseFee;
                student.PaymentPlan = fee.PaymentPlan.ToEnum<PaymentPlanType>();
                student.PaymentPlanDetails = fee.PaymentPlanDetails;
                student.FeeDueDate = fee.FeeDueDate;
                student.SendReminder = fee.SendReminder;
                student.ApplicationStatus = ApplicationStatus.FeeSetupCompleted;
            }
            task.FeeDetails = Serialize(fee);
        }

        task.Status = AccountingTaskStatus.Completed;
        task.AccountingRemarks = request.AccountingRemarks ?? task.AccountingRemarks;
        task.CompletedAt = DateTime.UtcNow;
        task.CompletedBy = request.CompletedBy;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return await GetTaskByIdAsync(id, ct);
    }

    public async Task<AccountingTaskDto?> SendToAdminAsync(string id, SendToAdminRequest request, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var task = await _db.AccountingTasks.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task is null) return null;

        if (request.FeeDetails is { } fee)
        {
            var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == task.StudentId, ct);
            if (student is not null)
            {
                student.CourseFee = fee.CourseFee;
                student.PaymentPlan = fee.PaymentPlan.ToEnum<PaymentPlanType>();
                student.PaymentPlanDetails = fee.PaymentPlanDetails;
                student.FeeDueDate = fee.FeeDueDate;
                student.SendReminder = fee.SendReminder;
                student.ApplicationStatus = ApplicationStatus.UnderReview;
            }
            task.FeeDetails = Serialize(fee);
        }

        task.Status = AccountingTaskStatus.InProgress;
        task.AccountingRemarks = request.AccountingRemarks ?? task.AccountingRemarks;
        task.ReviewedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return await GetTaskByIdAsync(id, ct);
    }

    public async Task<AccountingTaskDto?> ReviewTaskAsync(string id, ReviewTaskRequest request, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var task = await _db.AccountingTasks.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (task is null) return null;

        var student = await _db.Students.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == task.StudentId, ct);

        switch (request.Action)
        {
            case "accept":
                if (student is not null)
                {
                    student.ApplicationStatus = ApplicationStatus.Accepted;
                    student.UpdatedAt = DateTime.UtcNow;

                    await SendOfferLetterBestEffortAsync(student, ct);
                    student.OfferLetterSent = true;
                    student.OfferLetterSentAt = DateTime.UtcNow;
                }
                task.Status = AccountingTaskStatus.Completed;
                break;

            case "send_back":
                if (student is not null) { student.ApplicationStatus = ApplicationStatus.FeeSetupPending; student.UpdatedAt = DateTime.UtcNow; }
                task.Status = AccountingTaskStatus.Pending;
                break;

            case "reject":
                if (student is not null) { student.ApplicationStatus = ApplicationStatus.Rejected; student.UpdatedAt = DateTime.UtcNow; }
                task.Status = AccountingTaskStatus.Cancelled;
                break;

            default:
                throw new InvalidOperationException($"Unknown review action '{request.Action}'");
        }

        task.ReviewedBy = request.ReviewedBy;
        task.AdminRemarks = request.AdminRemarks;
        task.ReviewedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return await GetTaskByIdAsync(id, ct);
    }

    private async Task SendOfferLetterBestEffortAsync(Student student, CancellationToken ct)
    {
        try
        {
            var resetToken = new PasswordResetToken
            {
                Id = $"prt-{Guid.NewGuid()}",
                UserId = student.Id,
                UserType = OwnerType.Student,
                Token = Guid.NewGuid().ToString("N"),
                ExpiresAt = DateTime.UtcNow.AddHours(1),
                CreatedAt = DateTime.UtcNow,
            };
            _db.PasswordResetTokens.Add(resetToken);

            var content = EmailTemplates.StudentOfferLetter(
                $"{student.FirstName} {student.LastName}", student.Username, student.Course?.Title ?? "your course",
                student.Year, student.Cohort, student.CourseFee, student.PaymentPlan?.ToSnakeCase(),
                _smtpOptions.FrontendUrl, resetToken.Token);

            await _emailSender.SendAsync(student.Email, content.Subject, content.Html, content.Text, ct);
        }
        catch (Exception ex)
        {
            // Best-effort, matching source behavior: a failed offer-letter email must not block acceptance.
            _logger.LogError(ex, "Failed to send offer letter to {Email}", student.Email);
        }
    }

    public async Task<IReadOnlyList<SalaryDto>> GetAllSalariesAsync(string? employeeId, string? status, string? employeeType, CancellationToken ct = default)
    {
        var query = _db.Salaries.AsQueryable();
        if (!string.IsNullOrWhiteSpace(employeeId)) query = query.Where(s => s.EmployeeId == employeeId);
        if (status.TryToEnum<SalaryStatus>(out var statusEnum)) query = query.Where(s => s.Status == statusEnum);
        if (employeeType.TryToEnum<EmployeeType>(out var typeEnum)) query = query.Where(s => s.EmployeeType == typeEnum);

        var salaries = await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct);
        return salaries.Select(ToDto).ToList();
    }

    public async Task<SalaryDto?> GetSalaryByIdAsync(string id, CancellationToken ct = default)
    {
        var salary = await _db.Salaries.FirstOrDefaultAsync(s => s.Id == id, ct);
        return salary is null ? null : ToDto(salary);
    }

    public async Task<SalaryDto> CreateSalaryAsync(CreateSalaryRequest request, CancellationToken ct = default)
    {
        var netSalary = request.BaseSalary + request.Allowances - request.Deductions;
        var salary = new Salary
        {
            Id = $"salary-{Guid.NewGuid()}",
            EmployeeId = request.EmployeeId,
            EmployeeType = request.EmployeeType.ToEnum<EmployeeType>(),
            BaseSalary = request.BaseSalary,
            Allowances = request.Allowances,
            Deductions = request.Deductions,
            NetSalary = netSalary,
            PaymentFrequency = request.PaymentFrequency.ToEnum<PaymentFrequency>(),
            BankAccount = request.BankAccount,
            BankName = request.BankName,
            TaxId = request.TaxId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = SalaryStatus.Active,
            Notes = request.Notes,
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Salaries.Add(salary);
        await _db.SaveChangesAsync(ct);
        return ToDto(salary);
    }

    public async Task<SalaryDto?> UpdateSalaryAsync(string id, JsonElement patch, CancellationToken ct = default)
    {
        var salary = await _db.Salaries.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (salary is null) return null;

        var recompute = false;
        if (patch.GetDecimal("baseSalary") is { } baseSalary) { salary.BaseSalary = baseSalary; recompute = true; }
        if (patch.GetDecimal("allowances") is { } allowances) { salary.Allowances = allowances; recompute = true; }
        if (patch.GetDecimal("deductions") is { } deductions) { salary.Deductions = deductions; recompute = true; }
        if (recompute) salary.NetSalary = salary.BaseSalary + salary.Allowances - salary.Deductions;

        if (patch.GetString("paymentFrequency") is { } freq && freq.TryToEnum<PaymentFrequency>(out var freqEnum)) salary.PaymentFrequency = freqEnum;
        if (patch.GetString("status") is { } status && status.TryToEnum<SalaryStatus>(out var statusEnum)) salary.Status = statusEnum;
        if (patch.GetString("bankAccount") is { } bankAccount) salary.BankAccount = bankAccount;
        if (patch.GetString("bankName") is { } bankName) salary.BankName = bankName;
        if (patch.GetString("notes") is { } notes) salary.Notes = notes;
        if (patch.GetDateOnly("endDate") is { } endDate) salary.EndDate = endDate;
        salary.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(salary);
    }

    public async Task<IReadOnlyList<SalaryPaymentDto>> GetSalaryPaymentsAsync(string salaryId, CancellationToken ct = default)
    {
        var payments = await _db.SalaryPayments.Include(p => p.ProcessedByUser)
            .Where(p => p.SalaryId == salaryId).OrderByDescending(p => p.PaymentDate).ToListAsync(ct);
        return payments.Select(ToDto).ToList();
    }

    public async Task<SalaryPaymentDto> CreateSalaryPaymentAsync(string salaryId, CreateSalaryPaymentRequest request, CancellationToken ct = default)
    {
        var payment = new SalaryPayment
        {
            Id = $"salpay-{Guid.NewGuid()}",
            SalaryId = salaryId,
            PaymentDate = request.PaymentDate,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod.ToEnum<SalaryPaymentMethod>(),
            TransactionReference = request.TransactionReference,
            Status = SalaryPaymentStatus.Pending,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.SalaryPayments.Add(payment);
        await _db.SaveChangesAsync(ct);
        return ToDto(payment);
    }

    public async Task<SalaryPaymentDto?> UpdateSalaryPaymentAsync(string id, JsonElement patch, CancellationToken ct = default)
    {
        var payment = await _db.SalaryPayments.Include(p => p.ProcessedByUser).FirstOrDefaultAsync(p => p.Id == id, ct);
        if (payment is null) return null;

        if (patch.GetString("status") is { } status && status.TryToEnum<SalaryPaymentStatus>(out var statusEnum))
        {
            payment.Status = statusEnum;
            if (statusEnum == SalaryPaymentStatus.Processed && patch.GetDateTime("processedAt") is null)
            {
                payment.ProcessedAt = DateTime.UtcNow;
            }
        }
        if (patch.GetDateTime("processedAt") is { } processedAt) payment.ProcessedAt = processedAt;
        if (patch.GetString("processedBy") is { } processedBy) payment.ProcessedBy = processedBy;
        if (patch.GetString("transactionReference") is { } txnRef) payment.TransactionReference = txnRef;
        if (patch.GetString("notes") is { } notes) payment.Notes = notes;
        payment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(payment);
    }

    private static string? Serialize(object? value) => value is null ? null : JsonSerializer.Serialize(value);

    private static object? Deserialize(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try { return JsonSerializer.Deserialize<JsonElement>(json); } catch { return null; }
    }

    private static AccountingTaskDto ToDto(AccountingTask t) => new(
        t.Id, t.StudentId,
        t.Student is null ? null : $"{t.Student.FirstName} {t.Student.LastName}",
        t.Student?.Email, t.Student?.Phone, t.Student?.CourseId,
        t.TaskType.ToSnakeCase(), t.Status.ToSnakeCase(), t.Priority.ToSnakeCase(),
        t.AssignedTo, t.AssignedToUser?.Name,
        t.Title, t.Description, Deserialize(t.StudentData), Deserialize(t.FeeDetails),
        t.Notes, t.AdminRemarks, t.AccountingRemarks,
        t.CompletedAt, t.ReviewedAt, t.CompletedBy, t.ReviewedBy,
        t.CreatedAt, t.UpdatedAt);

    private static SalaryDto ToDto(Salary s) => new(
        s.Id, s.EmployeeId, s.EmployeeType.ToSnakeCase(), s.BaseSalary, s.Allowances, s.Deductions, s.NetSalary,
        s.PaymentFrequency.ToSnakeCase(), s.BankAccount, s.BankName, s.TaxId, s.StartDate, s.EndDate,
        s.Status.ToSnakeCase(), s.Notes, s.CreatedAt, s.UpdatedAt);

    private static SalaryPaymentDto ToDto(SalaryPayment p) => new(
        p.Id, p.SalaryId, p.PaymentDate, p.Amount, p.PaymentMethod.ToSnakeCase(), p.TransactionReference,
        p.Status.ToSnakeCase(), p.ProcessedAt, p.ProcessedByUser?.Name, p.Notes);
}
