using LuminaLms.Application.Auth;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Persistence;

/// <summary>
/// Idempotent seed data — default staff accounts and feature flags, matching
/// server/database/init.js / init-postgres.js / migrate-add-feature-flags.sql.
/// Unlike the source app, seed passwords are bcrypt-hashed at insert time rather
/// than stored as plaintext ('admin', 'faculty', 'accounting').
/// </summary>
public class DbSeeder
{
    private readonly LmsDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public DbSeeder(LmsDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        await SeedUserAsync("admin", "admin", "admin", UserRole.Admin, "Elena Park", "admin@lumina.edu", ct);
        await SeedUserAsync("faculty-1", "faculty", "faculty", UserRole.Faculty, "Dr. Sarah Johnson", "faculty@lumina.edu", ct);
        await SeedUserAsync("accounting-1", "accounting", "accounting", UserRole.Accounting, "Accounting Team", "accounting@lumina.edu", ct);

        await SeedFeatureFlagsAsync(ct);
    }

    private async Task SeedUserAsync(string id, string username, string password, UserRole role, string name, string email, CancellationToken ct)
    {
        if (await _db.Users.AnyAsync(u => u.Username == username || u.Email == email, ct)) return;

        _db.Users.Add(new User
        {
            Id = id,
            Username = username,
            Password = _passwordHasher.Hash(password),
            Role = role,
            Name = name,
            Email = email,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync(ct);
    }

    private async Task SeedFeatureFlagsAsync(CancellationToken ct)
    {
        (string Key, string Name, string Description)[] defaults =
        [
            ("onboarding_tour", "Onboarding Tour", "Interactive tour to help users learn the platform"),
            ("video_upload", "Video Upload", "Allow users to upload videos"),
            ("quiz_creation", "Quiz Creation", "Allow creation of quizzes and exams"),
            ("forum_creation", "Forum Creation", "Allow users to create forum threads"),
            ("certificate_creation", "Certificate Creation", "Allow creation of certificates"),
            ("assignment_upload", "Assignment Upload", "Allow students to upload assignments"),
            ("analytics_view", "Analytics View", "Allow users to view analytics"),
            ("achievements", "Achievements", "Show achievements and badges"),
        ];

        foreach (var (key, name, description) in defaults)
        {
            if (await _db.FeatureFlags.AnyAsync(f => f.FeatureKey == key, ct)) continue;

            _db.FeatureFlags.Add(new FeatureFlag
            {
                Id = $"flag-{key.Replace('_', '-')}",
                FeatureKey = key,
                FeatureName = name,
                Description = description,
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
        }
        await _db.SaveChangesAsync(ct);
    }
}
