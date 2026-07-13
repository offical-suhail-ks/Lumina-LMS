using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Subject).IsRequired().HasMaxLength(255);
        b.Property(x => x.Body).IsRequired();
        b.Property(x => x.SenderName).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.SenderId);
        b.HasIndex(x => x.RecipientId);
        b.HasIndex(x => x.CreatedAt);
        b.HasIndex(x => x.ReadByRecipient);
        b.HasIndex(x => new { x.IsAnnouncement, x.AnnouncementAudience });
    }
}

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Token).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.Token).IsUnique();
        b.HasIndex(x => new { x.UserId, x.UserType });
        b.HasIndex(x => x.ExpiresAt);
    }
}

public class FeatureFlagConfiguration : IEntityTypeConfiguration<FeatureFlag>
{
    public void Configure(EntityTypeBuilder<FeatureFlag> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.FeatureKey).IsRequired().HasMaxLength(255);
        b.Property(x => x.FeatureName).IsRequired().HasMaxLength(255);
        b.Property(x => x.RoleRestrictions).HasColumnType("jsonb");
        b.HasIndex(x => x.FeatureKey).IsUnique();
        b.HasIndex(x => x.IsEnabled);
    }
}
