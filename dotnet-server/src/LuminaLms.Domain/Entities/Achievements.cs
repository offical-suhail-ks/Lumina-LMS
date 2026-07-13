using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Achievement
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public int Points { get; set; }
    public AchievementType AchievementType { get; set; } = AchievementType.Custom;
    /// <summary>JSON payload, kept as text to match source (e.g. matched against course id via LIKE).</summary>
    public string? Criteria { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StudentAchievement
{
    public string Id { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public Student? Student { get; set; }
    public string AchievementId { get; set; } = default!;
    public Achievement? Achievement { get; set; }
    public DateTime EarnedAt { get; set; }
}
