namespace LuminaLms.Application.Dtos;

public record AccountingTaskDto(
    string Id, string StudentId, string? StudentName, string? StudentEmail, string? StudentPhone, string? CourseId,
    string TaskType, string Status, string Priority, string? AssignedTo, string? AssignedToName,
    string Title, string? Description, object? StudentData, object? FeeDetails,
    string? Notes, string? AdminRemarks, string? AccountingRemarks,
    DateTime? CompletedAt, DateTime? ReviewedAt, string? CompletedBy, string? ReviewedBy,
    DateTime CreatedAt, DateTime UpdatedAt);

public class CreateAccountingTaskRequest
{
    public string StudentId { get; set; } = default!;
    public string TaskType { get; set; } = "fee_setup";
    public string Priority { get; set; } = "medium";
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public object? StudentData { get; set; }
    public object? FeeDetails { get; set; }
    public string? AdminRemarks { get; set; }
}

public record FeeDetailsInput(decimal CourseFee, string PaymentPlan, string? PaymentPlanDetails, DateOnly? FeeDueDate, bool SendReminder);

public class CompleteAccountingTaskRequest
{
    public string CompletedBy { get; set; } = default!;
    public FeeDetailsInput? FeeDetails { get; set; }
    public string? AccountingRemarks { get; set; }
}

public class SendToAdminRequest
{
    public string CompletedBy { get; set; } = default!;
    public FeeDetailsInput? FeeDetails { get; set; }
    public string? AccountingRemarks { get; set; }
}

/// <summary>Action: "accept" | "send_back" | "reject".</summary>
public class ReviewTaskRequest
{
    public string ReviewedBy { get; set; } = default!;
    public string Action { get; set; } = default!;
    public string? AdminRemarks { get; set; }
}

public record SalaryDto(
    string Id, string EmployeeId, string EmployeeType, decimal BaseSalary, decimal Allowances, decimal Deductions,
    decimal NetSalary, string PaymentFrequency, string? BankAccount, string? BankName, string? TaxId,
    DateOnly StartDate, DateOnly? EndDate, string Status, string? Notes, DateTime CreatedAt, DateTime UpdatedAt);

public class CreateSalaryRequest
{
    public string EmployeeId { get; set; } = default!;
    public string EmployeeType { get; set; } = default!;
    public decimal BaseSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public string PaymentFrequency { get; set; } = "monthly";
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? TaxId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Notes { get; set; }
    public string? CreatedBy { get; set; }
}

public record SalaryPaymentDto(
    string Id, string SalaryId, DateOnly PaymentDate, decimal Amount, string PaymentMethod,
    string? TransactionReference, string Status, DateTime? ProcessedAt, string? ProcessedByName, string? Notes);

public class CreateSalaryPaymentRequest
{
    public DateOnly PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "bank_transfer";
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }
}
