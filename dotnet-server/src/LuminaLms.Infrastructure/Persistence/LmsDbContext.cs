using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Persistence;

public class LmsDbContext : DbContext
{
    public LmsDbContext(DbContextOptions<LmsDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Student> Students => Set<Student>();

    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<ModuleMaterial> ModuleMaterials => Set<ModuleMaterial>();
    public DbSet<CourseTag> CourseTags => Set<CourseTag>();
    public DbSet<CourseEnrollment> CourseEnrollments => Set<CourseEnrollment>();

    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();

    public DbSet<ChatGroup> ChatGroups => Set<ChatGroup>();
    public DbSet<ChatGroupMember> ChatGroupMembers => Set<ChatGroupMember>();
    public DbSet<ChatGroupMessage> ChatGroupMessages => Set<ChatGroupMessage>();
    public DbSet<PrivateChatThread> PrivateChatThreads => Set<PrivateChatThread>();
    public DbSet<PrivateChatMessage> PrivateChatMessages => Set<PrivateChatMessage>();

    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();

    public DbSet<AccountingTask> AccountingTasks => Set<AccountingTask>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<SalaryPayment> SalaryPayments => Set<SalaryPayment>();
    public DbSet<Payment> Payments => Set<Payment>();

    public DbSet<Attendance> Attendance => Set<Attendance>();
    public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();

    public DbSet<Message> Messages => Set<Message>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<FeatureFlag> FeatureFlags => Set<FeatureFlag>();

    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
    public DbSet<QuizQuestionOption> QuizQuestionOptions => Set<QuizQuestionOption>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAnswer> QuizAnswers => Set<QuizAnswer>();

    public DbSet<ForumCategory> ForumCategories => Set<ForumCategory>();
    public DbSet<ForumThread> ForumThreads => Set<ForumThread>();
    public DbSet<ForumReply> ForumReplies => Set<ForumReply>();

    public DbSet<Certificate> Certificates => Set<Certificate>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<AnalyticsEvent> AnalyticsEvents => Set<AnalyticsEvent>();

    public DbSet<CourseVideo> CourseVideos => Set<CourseVideo>();
    public DbSet<VideoProgress> VideoProgress => Set<VideoProgress>();

    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<StudentAchievement> StudentAchievements => Set<StudentAchievement>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Registers each Postgres enum with EF Core's *migration* model — distinct
        // from NpgsqlDataSourceBuilder.MapEnum (ADO.NET-level read/write mapping,
        // configured in NpgsqlEnumMappings). Without this, `dotnet ef migrations add`
        // never emits the `CREATE TYPE ... AS ENUM` statements the tables depend on.
        modelBuilder.HasPostgresEnum<UserRole>(name: "user_role");
        modelBuilder.HasPostgresEnum<StudentStatus>(name: "student_status");
        modelBuilder.HasPostgresEnum<PaymentPlanType>(name: "payment_plan_type");
        modelBuilder.HasPostgresEnum<ApplicationStatus>(name: "application_status_enum");
        modelBuilder.HasPostgresEnum<OwnerType>(name: "user_type_enum");

        modelBuilder.HasPostgresEnum<BatchTiming>(name: "batch_timing_enum");
        modelBuilder.HasPostgresEnum<ScheduleType>(name: "schedule_type_enum");
        modelBuilder.HasPostgresEnum<AttendanceStatus>(name: "attendance_status_enum");

        modelBuilder.HasPostgresEnum<AccountingTaskType>(name: "task_type_enum");
        modelBuilder.HasPostgresEnum<AccountingTaskStatus>(name: "task_status_enum");
        modelBuilder.HasPostgresEnum<Priority>(name: "priority_enum");
        modelBuilder.HasPostgresEnum<EmployeeType>(name: "employee_type_enum");
        modelBuilder.HasPostgresEnum<PaymentFrequency>(name: "payment_frequency_enum");
        modelBuilder.HasPostgresEnum<SalaryStatus>(name: "salary_status_enum");
        modelBuilder.HasPostgresEnum<SalaryPaymentMethod>(name: "salary_payment_method_enum");
        modelBuilder.HasPostgresEnum<SalaryPaymentStatus>(name: "salary_payment_status_enum");
        modelBuilder.HasPostgresEnum<PaymentStatus>(name: "payment_status_enum");

        modelBuilder.HasPostgresEnum<MessageRole>(name: "message_role_enum");
        modelBuilder.HasPostgresEnum<AnnouncementAudience>(name: "announcement_audience_enum");

        modelBuilder.HasPostgresEnum<QuizType>(name: "quiz_type_enum");
        modelBuilder.HasPostgresEnum<QuestionType>(name: "question_type_enum");
        modelBuilder.HasPostgresEnum<QuizAttemptStatus>(name: "quiz_status_enum");
        modelBuilder.HasPostgresEnum<ForumRole>(name: "forum_role_enum");

        modelBuilder.HasPostgresEnum<CertificateType>(name: "certificate_type_enum");
        modelBuilder.HasPostgresEnum<NotificationType>(name: "notification_type_enum");
        modelBuilder.HasPostgresEnum<VideoType>(name: "video_type_enum");
        modelBuilder.HasPostgresEnum<AchievementType>(name: "achievement_type_enum");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LmsDbContext).Assembly);
    }
}
