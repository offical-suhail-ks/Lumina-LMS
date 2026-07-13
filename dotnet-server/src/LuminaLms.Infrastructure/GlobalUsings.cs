// Application-layer feature namespaces: Infrastructure implements these
// interfaces and consumes their DTOs, so they're exposed globally rather than
// tracked per-file across ~20 service implementations.
global using LuminaLms.Application.Features.Academics;
global using LuminaLms.Application.Features.Accounting;
global using LuminaLms.Application.Features.Achievements;
global using LuminaLms.Application.Features.ActivityLogs;
global using LuminaLms.Application.Features.Analytics;
global using LuminaLms.Application.Features.Assignments;
global using LuminaLms.Application.Features.Attendance;
global using LuminaLms.Application.Features.Calendar;
global using LuminaLms.Application.Features.Certificates;
global using LuminaLms.Application.Features.FeatureFlags;
global using LuminaLms.Application.Features.Forum;
global using LuminaLms.Application.Features.Mailbox;
global using LuminaLms.Application.Features.Notifications;
global using LuminaLms.Application.Features.Payments;
global using LuminaLms.Application.Features.Quizzes;
global using LuminaLms.Application.Features.Staff;
global using LuminaLms.Application.Features.Students;
global using LuminaLms.Application.Features.Videos;

// This project's own mirrored feature namespaces (needed by DependencyInjection.cs,
// which references every concrete service implementation by type).
global using LuminaLms.Infrastructure.Features.Academics;
global using LuminaLms.Infrastructure.Features.Accounting;
global using LuminaLms.Infrastructure.Features.Achievements;
global using LuminaLms.Infrastructure.Features.ActivityLogs;
global using LuminaLms.Infrastructure.Features.Analytics;
global using LuminaLms.Infrastructure.Features.Assignments;
global using LuminaLms.Infrastructure.Features.Attendance;
global using LuminaLms.Infrastructure.Features.Calendar;
global using LuminaLms.Infrastructure.Features.Certificates;
global using LuminaLms.Infrastructure.Features.FeatureFlags;
global using LuminaLms.Infrastructure.Features.Forum;
global using LuminaLms.Infrastructure.Features.Mailbox;
global using LuminaLms.Infrastructure.Features.Notifications;
global using LuminaLms.Infrastructure.Features.Payments;
global using LuminaLms.Infrastructure.Features.Quizzes;
global using LuminaLms.Infrastructure.Features.Staff;
global using LuminaLms.Infrastructure.Features.Students;
global using LuminaLms.Infrastructure.Features.Videos;
global using LuminaLms.Infrastructure.Auth;
global using LuminaLms.Infrastructure.Email;
global using LuminaLms.Infrastructure.Storage;
