namespace LuminaLms.Domain.Enums;

public enum AccountingTaskType
{
    FeeSetup,
    FeeUpdate,
    PaymentVerification,
    Refund,
    Other
}

public enum AccountingTaskStatus
{
    Pending,
    InProgress,
    Completed,
    Cancelled
}

public enum Priority
{
    Low,
    Medium,
    High,
    Urgent
}

public enum EmployeeType
{
    Faculty,
    Staff,
    Admin
}

public enum PaymentFrequency
{
    Monthly,
    Biweekly,
    Weekly
}

public enum SalaryStatus
{
    Active,
    Inactive,
    Suspended
}

public enum SalaryPaymentMethod
{
    BankTransfer,
    Check,
    Cash,
    Other
}

public enum SalaryPaymentStatus
{
    Pending,
    Processed,
    Failed,
    Cancelled
}

public enum PaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded
}
