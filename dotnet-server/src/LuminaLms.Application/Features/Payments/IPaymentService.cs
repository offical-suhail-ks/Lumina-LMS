
namespace LuminaLms.Application.Features.Payments;

public interface IPaymentService
{
    Task<PaymentSummaryDto> GetPaymentSummaryAsync(string studentId, CancellationToken ct = default);
    Task<ProcessPaymentResult> ProcessPaymentAsync(CreatePaymentRequest request, CancellationToken ct = default);

    /// <summary>Bulk reminder sweep for students whose fee is due within <paramref name="daysBefore"/> days. Returns (sent, errors, total).</summary>
    Task<(int Sent, int Errors, int Total)> SendRemindersAsync(int daysBefore, CancellationToken ct = default);

    /// <summary>Returns false if the student has no fee due date or no remaining balance.</summary>
    Task<bool> SendReminderToStudentAsync(string studentId, CancellationToken ct = default);
}
