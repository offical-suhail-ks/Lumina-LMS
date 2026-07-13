namespace LuminaLms.Application.Features.Payments;

public record PaymentDto(
    string Id, string StudentId, decimal Amount, int? InstallmentNumber, int? TotalInstallments,
    string PaymentMethod, string PaymentStatus, string? TransactionId, string PaymentGateway,
    string? Notes, DateTime? PaidAt, DateTime CreatedAt, DateTime UpdatedAt);

public record InstallmentDto(int Number, decimal Amount, DateOnly? DueDate, string Status, DateTime? PaidAt, string? PaymentId);

public record PaymentSummaryDto(
    decimal TotalFee, decimal PaidAmount, decimal RemainingAmount, string? PaymentPlan, string? PaymentPlanDetails,
    IReadOnlyList<InstallmentDto> Installments, IReadOnlyList<PaymentDto> PaymentHistory);

public class CreatePaymentRequest
{
    public string StudentId { get; set; } = default!;
    public decimal Amount { get; set; }
    public int? InstallmentNumber { get; set; }
    public int? TotalInstallments { get; set; }
    public string PaymentMethod { get; set; } = "card";
    /// <summary>Mock gateway input only — never persisted.</summary>
    public string? CardNumber { get; set; }
}

public record ProcessPaymentResult(bool Success, PaymentDto? Payment, string Message);
