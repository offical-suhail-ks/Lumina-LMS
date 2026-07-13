using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.CertificateNumber).IsRequired().HasMaxLength(255);
        b.Property(x => x.VerificationCode).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.StudentId);
        b.HasIndex(x => x.CourseId);
        b.HasIndex(x => x.CertificateNumber).IsUnique();
        b.HasIndex(x => x.VerificationCode).IsUnique();
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.Message).IsRequired();
        b.HasIndex(x => new { x.UserId, x.UserType });
        b.HasIndex(x => x.IsRead);
        b.HasIndex(x => x.CreatedAt);
    }
}

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Action).IsRequired().HasMaxLength(100);
        b.HasIndex(x => new { x.UserId, x.UserType });
        b.HasIndex(x => x.Action);
        b.HasIndex(x => new { x.EntityType, x.EntityId });
        b.HasIndex(x => x.CreatedAt);
    }
}

public class AnalyticsEventConfiguration : IEntityTypeConfiguration<AnalyticsEvent>
{
    public void Configure(EntityTypeBuilder<AnalyticsEvent> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.EventType).IsRequired().HasMaxLength(100);
        b.HasIndex(x => x.EventType);
        b.HasIndex(x => new { x.UserId, x.UserType });
        b.HasIndex(x => x.CreatedAt);
    }
}
