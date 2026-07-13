using System.Text.Json;
using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class AchievementService : IAchievementService
{
    private readonly LmsDbContext _db;

    public AchievementService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<AchievementDto> CreateAsync(CreateAchievementRequest request, CancellationToken ct = default)
    {
        var achievement = new Achievement
        {
            Id = $"ach-{Guid.NewGuid()}",
            Name = request.Name,
            Description = request.Description,
            IconUrl = request.IconUrl,
            Points = request.Points,
            AchievementType = request.AchievementType.ToEnum<Domain.Enums.AchievementType>(),
            Criteria = request.Criteria is null ? null : JsonSerializer.Serialize(request.Criteria),
            CreatedAt = DateTime.UtcNow,
        };
        _db.Achievements.Add(achievement);
        await _db.SaveChangesAsync(ct);
        return ToDto(achievement);
    }

    public async Task<IReadOnlyList<AchievementDto>> GetAllAsync(CancellationToken ct = default)
    {
        var achievements = await _db.Achievements.OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
        return achievements.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<StudentAchievementDto>> GetStudentAchievementsAsync(string studentId, CancellationToken ct = default)
    {
        var records = await _db.StudentAchievements.Include(sa => sa.Achievement)
            .Where(sa => sa.StudentId == studentId).OrderByDescending(sa => sa.EarnedAt).ToListAsync(ct);

        return records.Select(sa => new StudentAchievementDto(
            sa.Id, sa.StudentId, sa.AchievementId, sa.EarnedAt,
            sa.Achievement?.Name, sa.Achievement?.Description, sa.Achievement?.IconUrl, sa.Achievement?.Points,
            sa.Achievement?.AchievementType.ToSnakeCase())).ToList();
    }

    public async Task<StudentAchievementDto> AwardAsync(string studentId, string achievementId, CancellationToken ct = default)
    {
        var existing = await _db.StudentAchievements.Include(sa => sa.Achievement)
            .FirstOrDefaultAsync(sa => sa.StudentId == studentId && sa.AchievementId == achievementId, ct);
        if (existing is not null)
        {
            return ToStudentAchievementDto(existing);
        }

        var studentAchievement = new StudentAchievement
        {
            Id = $"sa-{Guid.NewGuid()}",
            StudentId = studentId,
            AchievementId = achievementId,
            EarnedAt = DateTime.UtcNow,
        };
        _db.StudentAchievements.Add(studentAchievement);
        await _db.SaveChangesAsync(ct);

        var achievement = await _db.Achievements.FirstOrDefaultAsync(a => a.Id == achievementId, ct);
        return new StudentAchievementDto(studentAchievement.Id, studentId, achievementId, studentAchievement.EarnedAt,
            achievement?.Name, achievement?.Description, achievement?.IconUrl, achievement?.Points);
    }

    public async Task CheckAndAwardAchievementsAsync(string studentId, CancellationToken ct = default)
    {
        var enrolledCourseIds = await _db.CourseEnrollments.Where(e => e.StudentId == studentId).Select(e => e.CourseId).ToListAsync(ct);

        foreach (var courseId in enrolledCourseIds)
        {
            // Criteria linkage is a substring match against a JSON blob (matches
            // source app's LIKE '%courseId%'), not a real relational column.
            var achievement = await _db.Achievements
                .Where(a => a.AchievementType == Domain.Enums.AchievementType.CourseCompletion && a.Criteria != null && a.Criteria.Contains(courseId))
                .FirstOrDefaultAsync(ct);

            if (achievement is not null)
            {
                await AwardAsync(studentId, achievement.Id, ct);
            }
        }
    }

    private static StudentAchievementDto ToStudentAchievementDto(StudentAchievement sa) => new(
        sa.Id, sa.StudentId, sa.AchievementId, sa.EarnedAt,
        sa.Achievement?.Name, sa.Achievement?.Description, sa.Achievement?.IconUrl, sa.Achievement?.Points);

    private static AchievementDto ToDto(Achievement a) => new(
        a.Id, a.Name, a.Description, a.IconUrl, a.Points, a.AchievementType.ToSnakeCase(),
        string.IsNullOrWhiteSpace(a.Criteria) ? null : JsonSerializer.Deserialize<JsonElement>(a.Criteria), a.CreatedAt);
}
