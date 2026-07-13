
namespace LuminaLms.Application.Features.Achievements;

public interface IAchievementService
{
    Task<AchievementDto> CreateAsync(CreateAchievementRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<AchievementDto>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<StudentAchievementDto>> GetStudentAchievementsAsync(string studentId, CancellationToken ct = default);
    Task<StudentAchievementDto> AwardAsync(string studentId, string achievementId, CancellationToken ct = default);

    /// <summary>Awards course-completion achievements whose criteria references one of the student's enrolled course ids.</summary>
    Task CheckAndAwardAchievementsAsync(string studentId, CancellationToken ct = default);
}
