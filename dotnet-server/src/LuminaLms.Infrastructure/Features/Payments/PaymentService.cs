using System.Text.RegularExpressions;
using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Options;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LuminaLms.Infrastructure.Features.Payments;

public partial class PaymentService : IPaymentService
{
    private readonly LmsDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly SmtpOptions _smtpOptions;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(LmsDbContext db, IEmailSender emailSender, IOptions<SmtpOptions> smtpOptions, ILogger<PaymentService> logger)
    {
        _db = db;
        _emailSender = emailSender;
        _smtpOptions = smtpOptions.Value;
        _logger = logger;
    }

    public async Task<PaymentSummaryDto> GetPaymentSummaryAsync(string studentId, CancellationToken ct = default)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == studentId, ct);
        if (student?.CourseFee is null)
        {
            return new PaymentSummaryDto(0, 0, 0, null, null, [], []);
        }

        var payments = await _db.Payments.Where(p => p.StudentId == studentId).OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
        var completed = payments.Where(p => p.PaymentStatus == PaymentStatus.Completed).ToList();
        var paidAmount = completed.Sum(p => p.Amount);
        var totalFee = student.CourseFee.Value;
        var remainingAmount = totalFee - paidAmount;

        var installments = new List<InstallmentDto>();
        if (student.PaymentPlan == PaymentPlanType.Installment && !string.IsNullOrWhiteSpace(student.PaymentPlanDetails))
        {
            var match = InstallmentPattern().Match(student.PaymentPlanDetails);
            if (match.Success)
            {
                var totalInstallments = int.Parse(match.Groups[1].Value);
                var installmentAmount = decimal.Parse(match.Groups[2].Value);
                var paidCount = completed.Count;

                for (var i = 1; i <= totalInstallments; i++)
                {
                    var payment = completed.FirstOrDefault(p => p.InstallmentNumber == i);
                    var paid = payment is not null || i <= paidCount;
                    installments.Add(new InstallmentDto(i, installmentAmount, null, paid ? "paid" : "pending", payment?.PaidAt, payment?.Id));
                }
            }
        }
        else if (student.PaymentPlan == PaymentPlanType.Full)
        {
            var payment = completed.FirstOrDefault();
            installments.Add(new InstallmentDto(1, totalFee, null, payment is not null ? "paid" : "pending", payment?.PaidAt, payment?.Id));
        }

        return new PaymentSummaryDto(totalFee, paidAmount, remainingAmount, student.PaymentPlan?.ToSnakeCase(), student.PaymentPlanDetails,
            installments, payments.Select(ToDto).ToList());
    }

    public async Task<ProcessPaymentResult> ProcessPaymentAsync(CreatePaymentRequest request, CancellationToken ct = default)
    {
        // Mock payment gateway: accepts any card number ending in an even digit.
        var lastDigitChar = request.CardNumber?.Length > 0 ? request.CardNumber[^1] : (char?)null;
        var isValid = lastDigitChar is not null && char.IsDigit(lastDigitChar.Value) && (lastDigitChar.Value - '0') % 2 == 0;

        if (!isValid)
        {
            return new ProcessPaymentResult(false, null, "Payment failed. Please check your card details.");
        }

        var transactionId = $"txn_{Guid.NewGuid()}";
        var last4 = request.CardNumber?.Length >= 4 ? request.CardNumber[^4..] : request.CardNumber;

        var payment = new Payment
        {
            Id = $"payment-{Guid.NewGuid()}",
            StudentId = request.StudentId,
            Amount = request.Amount,
            InstallmentNumber = request.InstallmentNumber,
            TotalInstallments = request.TotalInstallments,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = PaymentStatus.Completed,
            TransactionId = transactionId,
            PaymentGateway = "mock",
            Notes = $"Payment via mock gateway. Card: ****{last4}",
            PaidAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        return new ProcessPaymentResult(true, ToDto(payment), "Payment processed successfully");
    }

    public async Task<(int Sent, int Errors, int Total)> SendRemindersAsync(int daysBefore, CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var cutoff = today.AddDays(daysBefore);

        var students = await _db.Students
            .Where(s => s.FeeDueDate != null && s.SendReminder && s.Status == StudentStatus.Active
                        && s.FeeDueDate >= today && s.FeeDueDate <= cutoff)
            .OrderBy(s => s.FeeDueDate)
            .ToListAsync(ct);

        int sent = 0, errors = 0;
        foreach (var student in students)
        {
            try
            {
                var summary = await GetPaymentSummaryAsync(student.Id, ct);
                if (summary.RemainingAmount > 0)
                {
                    await SendReminderEmailAsync(student, summary.RemainingAmount, ct);
                    sent++;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending payment reminder to {Email}", student.Email);
                errors++;
            }
        }

        return (sent, errors, students.Count);
    }

    public async Task<bool> SendReminderToStudentAsync(string studentId, CancellationToken ct = default)
    {
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == studentId, ct);
        if (student?.FeeDueDate is null) return false;

        var summary = await GetPaymentSummaryAsync(studentId, ct);
        if (summary.RemainingAmount <= 0) return false;

        await SendReminderEmailAsync(student, summary.RemainingAmount, ct);
        return true;
    }

    private async Task SendReminderEmailAsync(Student student, decimal remainingAmount, CancellationToken ct)
    {
        var content = EmailTemplates.PaymentReminder($"{student.FirstName} {student.LastName}", remainingAmount, student.FeeDueDate!.Value, _smtpOptions.FrontendUrl);
        await _emailSender.SendAsync(student.Email, content.Subject, content.Html, content.Text, ct);
    }

    private static PaymentDto ToDto(Payment p) => new(
        p.Id, p.StudentId, p.Amount, p.InstallmentNumber, p.TotalInstallments, p.PaymentMethod,
        p.PaymentStatus.ToSnakeCase(), p.TransactionId, p.PaymentGateway, p.Notes, p.PaidAt, p.CreatedAt, p.UpdatedAt);

    [GeneratedRegex(@"(\d+)\s+installments\s+of\s+\$([\d.]+)", RegexOptions.IgnoreCase)]
    private static partial Regex InstallmentPattern();
}
