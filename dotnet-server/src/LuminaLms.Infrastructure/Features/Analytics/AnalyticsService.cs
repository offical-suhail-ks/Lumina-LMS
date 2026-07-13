using System.Text.Json;
using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.Analytics;

public class AnalyticsService : IAnalyticsService
{
    private readonly LmsDbContext _db;

    public AnalyticsService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task TrackEventAsync(TrackEventRequest request, CancellationToken ct = default)
    {
        var evt = new AnalyticsEvent
        {
            Id = $"event-{Guid.NewGuid()}",
            EventType = request.EventType,
            UserId = request.UserId,
            UserType = request.UserType.TryToEnum<OwnerType>(out var ut) ? ut : null,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Metadata = request.Metadata is null ? null : JsonSerializer.Serialize(request.Metadata),
            CreatedAt = DateTime.UtcNow,
        };
        _db.AnalyticsEvents.Add(evt);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<StudentPerformanceDto> GetStudentPerformanceAsync(string studentId, CancellationToken ct = default)
    {
        var assignmentGrades = await _db.AssignmentSubmissions
            .Where(s => s.StudentId == studentId)
            .Join(_db.Assignments, s => s.AssignmentId, a => a.Id, (s, a) => new AssignmentGradeEntry(a.Id, a.Title, a.CourseId, s.Grade, s.SubmittedAt))
            .OrderByDescending(x => x.SubmittedAt)
            .ToListAsync(ct);

        var quizScores = await _db.QuizAttempts
            .Where(a => a.StudentId == studentId && a.Status == QuizAttemptStatus.Submitted)
            .Join(_db.Quizzes, a => a.QuizId, q => q.Id, (a, q) => new QuizScoreEntry(q.Id, q.Title, q.CourseId, a.Score, a.Percentage, a.Passed, a.SubmittedAt))
            .OrderByDescending(x => x.SubmittedAt)
            .ToListAsync(ct);

        var assignmentAvg = assignmentGrades.Count > 0 ? assignmentGrades.Average(a => a.Grade ?? 0) : 0;
        var quizAvg = quizScores.Count > 0 ? quizScores.Average(q => q.Percentage ?? 0) : 0;

        return new StudentPerformanceDto(assignmentGrades, quizScores, assignmentAvg, quizAvg, (assignmentAvg + quizAvg) / 2);
    }

    public async Task<CourseAnalyticsDto> GetCourseAnalyticsAsync(string courseId, CancellationToken ct = default)
    {
        var enrollmentCount = await _db.CourseEnrollments.CountAsync(e => e.CourseId == courseId, ct);

        var totalAssignments = await _db.Assignments.CountAsync(a => a.CourseId == courseId, ct);
        var totalSubmissions = await _db.AssignmentSubmissions.CountAsync(s => s.Assignment!.CourseId == courseId, ct);
        var gradedSubmissions = await _db.AssignmentSubmissions.CountAsync(s => s.Assignment!.CourseId == courseId && s.Grade != null, ct);

        var totalQuizzes = await _db.Quizzes.CountAsync(q => q.CourseId == courseId, ct);
        var submittedAttempts = await _db.QuizAttempts
            .Join(_db.Quizzes.Where(q => q.CourseId == courseId), a => a.QuizId, q => q.Id, (a, q) => a)
            .Where(a => a.Status == QuizAttemptStatus.Submitted)
            .ToListAsync(ct);

        var averageScore = submittedAttempts.Count > 0 ? (decimal?)submittedAttempts.Average(a => a.Percentage ?? 0) : null;

        return new CourseAnalyticsDto(
            enrollmentCount,
            new AssignmentStatsDto(totalAssignments, totalSubmissions, gradedSubmissions),
            new QuizStatsDto(totalQuizzes, submittedAttempts.Count, averageScore));
    }

    public async Task<SystemAnalyticsDto> GetSystemAnalyticsAsync(CancellationToken ct = default)
    {
        var studentCount = await _db.Students.CountAsync(s => s.Status == StudentStatus.Active, ct);
        var courseCount = await _db.Courses.CountAsync(ct);
        var assignmentCount = await _db.Assignments.CountAsync(ct);
        var submissionCount = await _db.AssignmentSubmissions.CountAsync(ct);

        var cutoff = DateTime.UtcNow.AddDays(-7);
        var recentEvents = await _db.AnalyticsEvents.Where(e => e.CreatedAt >= cutoff)
            .Select(e => new { e.EventType, e.CreatedAt })
            .ToListAsync(ct);

        var recentActivity = recentEvents
            .GroupBy(e => (e.EventType, Date: DateOnly.FromDateTime(e.CreatedAt)))
            .Select(g => new RecentActivityEntry(g.Key.EventType, g.Count(), g.Key.Date))
            .OrderByDescending(e => e.Date).ThenByDescending(e => e.Count)
            .Take(20)
            .ToList();

        return new SystemAnalyticsDto(studentCount, courseCount, assignmentCount, submissionCount, recentActivity);
    }
}
