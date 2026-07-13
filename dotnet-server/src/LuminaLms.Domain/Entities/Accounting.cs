using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class AccountingTask
{
    public string Id { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public AccountingTaskType TaskType { get; set; } = AccountingTaskType.FeeSetup;
    public AccountingTaskStatus Status { get; set; } = AccountingTaskStatus.Pending;
    public Priority Priority { get; set; } = Priority.Medium;
    public string? AssignedTo { get; set; }
    public User? AssignedToUser { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    /// <summary>JSON snapshot of the student at task-creation time.</summary>
    public string? StudentData { get; set; }
    /// <summary>JSON fee breakdown (course fee, plan, installments).</summary>
    public string? FeeDetails { get; set; }
    public string? Notes { get; set; }
    public string? AdminRemarks { get; set; }
    public string? AccountingRemarks { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? CompletedBy { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Salary
{
    public string Id { get; set; } = default!;
    /// <summary>References users.id (faculty/staff/admin); no FK enforced in source schema.</summary>
    public string EmployeeId { get; set; } = default!;
    public EmployeeType EmployeeType { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    public PaymentFrequency PaymentFrequency { get; set; } = PaymentFrequency.Monthly;
    public string? BankAccount { get; set; }
    public string? BankName { get; set; }
    public string? TaxId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public SalaryStatus Status { get; set; } = SalaryStatus.Active;
    public string? Notes { get; set; }
    public string? CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<SalaryPayment> Payments { get; set; } = new List<SalaryPayment>();
}

public class SalaryPayment
{
    public string Id { get; set; } = default!;
    public string SalaryId { get; set; } = default!;
    public Salary? Salary { get; set; }
    public DateOnly PaymentDate { get; set; }
    public decimal Amount { get; set; }
    public SalaryPaymentMethod PaymentMethod { get; set; } = SalaryPaymentMethod.BankTransfer;
    public string? TransactionReference { get; set; }
    public SalaryPaymentStatus Status { get; set; } = SalaryPaymentStatus.Pending;
    public DateTime? ProcessedAt { get; set; }
    public string? ProcessedBy { get; set; }
    public User? ProcessedByUser { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>Student course-fee payments; distinct from staff SalaryPayment.</summary>
public class Payment
{
    public string Id { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public decimal Amount { get; set; }
    public int? InstallmentNumber { get; set; }
    public int? TotalInstallments { get; set; }
    public string PaymentMethod { get; set; } = "card";
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? TransactionId { get; set; }
    public string PaymentGateway { get; set; } = "mock";
    public string? Notes { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
