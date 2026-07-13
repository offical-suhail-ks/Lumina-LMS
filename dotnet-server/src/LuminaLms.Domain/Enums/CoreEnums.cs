namespace LuminaLms.Domain.Enums;

public enum UserRole
{
    Admin,
    Faculty,
    Student,
    Parent,
    Accounting
}

public enum StudentStatus
{
    Active,
    Inactive,
    Suspended
}

public enum PaymentPlanType
{
    Full,
    Installment,
    Scholarship,
    Waived
}

public enum ApplicationStatus
{
    Pending,
    FeeSetupPending,
    FeeSetupCompleted,
    UnderReview,
    Accepted,
    Rejected
}

/// <summary>Polymorphic discriminator: many tables reference either `users` or `students` by id.</summary>
public enum OwnerType
{
    User,
    Student
}
