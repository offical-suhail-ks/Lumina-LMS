using LuminaLms.Domain.Enums;
using Npgsql;

namespace LuminaLms.Infrastructure.Persistence;

/// <summary>
/// Registers every native PostgreSQL enum type used by the schema so Npgsql can
/// read/write them directly as strongly-typed C# enums. Member names use
/// PascalCase equivalents of the snake_case Postgres labels (e.g. FeeSetupPending
/// -> 'fee_setup_pending'), which Npgsql's default snake_case translator resolves
/// automatically — no per-member name overrides needed.
/// </summary>
public static class NpgsqlEnumMappings
{
    public static NpgsqlDataSourceBuilder MapLmsEnums(this NpgsqlDataSourceBuilder builder)
    {
        builder.MapEnum<UserRole>("user_role");
        builder.MapEnum<StudentStatus>("student_status");
        builder.MapEnum<PaymentPlanType>("payment_plan_type");
        builder.MapEnum<ApplicationStatus>("application_status_enum");
        builder.MapEnum<OwnerType>("user_type_enum");

        builder.MapEnum<BatchTiming>("batch_timing_enum");
        builder.MapEnum<ScheduleType>("schedule_type_enum");
        builder.MapEnum<AttendanceStatus>("attendance_status_enum");

        builder.MapEnum<AccountingTaskType>("task_type_enum");
        builder.MapEnum<AccountingTaskStatus>("task_status_enum");
        builder.MapEnum<Priority>("priority_enum");
        builder.MapEnum<EmployeeType>("employee_type_enum");
        builder.MapEnum<PaymentFrequency>("payment_frequency_enum");
        builder.MapEnum<SalaryStatus>("salary_status_enum");
        builder.MapEnum<SalaryPaymentMethod>("salary_payment_method_enum");
        builder.MapEnum<SalaryPaymentStatus>("salary_payment_status_enum");
        builder.MapEnum<PaymentStatus>("payment_status_enum");

        builder.MapEnum<MessageRole>("message_role_enum");
        builder.MapEnum<AnnouncementAudience>("announcement_audience_enum");

        builder.MapEnum<QuizType>("quiz_type_enum");
        builder.MapEnum<QuestionType>("question_type_enum");
        builder.MapEnum<QuizAttemptStatus>("quiz_status_enum");
        builder.MapEnum<ForumRole>("forum_role_enum");

        builder.MapEnum<CertificateType>("certificate_type_enum");
        builder.MapEnum<NotificationType>("notification_type_enum");
        builder.MapEnum<VideoType>("video_type_enum");
        builder.MapEnum<AchievementType>("achievement_type_enum");

        return builder;
    }
}
