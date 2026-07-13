using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class CourseVideoConfiguration : IEntityTypeConfiguration<CourseVideo>
{
    public void Configure(EntityTypeBuilder<CourseVideo> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.CourseId);
        b.HasIndex(x => x.ModuleId);
    }
}

public class VideoProgressConfiguration : IEntityTypeConfiguration<VideoProgress>
{
    public void Configure(EntityTypeBuilder<VideoProgress> b)
    {
        b.ToTable("video_progress");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.ProgressPercentage).HasColumnType("decimal(5,2)");
        b.HasIndex(x => x.StudentId);
        b.HasIndex(x => new { x.VideoId, x.StudentId }).IsUnique();
    }
}

public class AchievementConfiguration : IEntityTypeConfiguration<Achievement>
{
    public void Configure(EntityTypeBuilder<Achievement> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Name).IsRequired().HasMaxLength(255);
    }
}

public class StudentAchievementConfiguration : IEntityTypeConfiguration<StudentAchievement>
{
    public void Configure(EntityTypeBuilder<StudentAchievement> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.HasIndex(x => x.StudentId);
        b.HasIndex(x => new { x.StudentId, x.AchievementId }).IsUnique();

        b.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Achievement)
            .WithMany()
            .HasForeignKey(x => x.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
