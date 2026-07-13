namespace LuminaLms.Application.Features.Achievements;

public record AchievementDto(string Id, string Name, string? Description, string? IconUrl, int Points, string AchievementType, object? Criteria, DateTime CreatedAt);

public record StudentAchievementDto(string Id, string StudentId, string AchievementId, DateTime EarnedAt, string? AchievementName, string? AchievementDescription, string? AchievementIcon, int? AchievementPoints, string? AchievementType = null);

public class CreateAchievementRequest
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public int Points { get; set; }
    public string AchievementType { get; set; } = "custom";
    public object? Criteria { get; set; }
}
