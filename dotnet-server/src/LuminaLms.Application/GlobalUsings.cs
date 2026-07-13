// Feature namespaces are exposed globally so DTOs/interfaces in one feature
// folder can reference another without every consumer having to track exactly
// which of the ~20 feature namespaces a given type lives in.
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
