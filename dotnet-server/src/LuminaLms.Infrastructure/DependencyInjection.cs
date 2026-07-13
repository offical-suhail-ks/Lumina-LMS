using LuminaLms.Application.Auth;
using LuminaLms.Application.Common;
using LuminaLms.Infrastructure.Options;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace LuminaLms.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:Postgres configuration.");
        connectionString = PostgresConnectionStringHelper.Normalize(connectionString);

        var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
        dataSourceBuilder.MapLmsEnums();
        var dataSource = dataSourceBuilder.Build();
        services.AddSingleton(dataSource);

        services.AddDbContext<LmsDbContext>(options =>
            options.UseNpgsql(dataSource).UseSnakeCaseNamingConvention());
        services.AddScoped<DbSeeder>();

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<SmtpOptions>(configuration.GetSection(SmtpOptions.SectionName));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));

        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IAccountingService, AccountingService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<IModuleService, ModuleService>();
        services.AddScoped<IStaffAccountService, StaffAccountService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ICalendarService, CalendarService>();
        services.AddScoped<IMailboxService, MailboxService>();
        services.AddScoped<IPasswordResetService, PasswordResetService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IQuizService, QuizService>();
        services.AddScoped<IForumService, ForumService>();
        services.AddScoped<ICertificateService, CertificateService>();
        services.AddScoped<IAchievementService, AchievementService>();
        services.AddScoped<IVideoService, VideoService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();
        services.AddScoped<IFeatureFlagService, FeatureFlagService>();

        return services;
    }
}
