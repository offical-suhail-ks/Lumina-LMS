using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class ChatGroupConfiguration : IEntityTypeConfiguration<ChatGroup>
{
    public void Configure(EntityTypeBuilder<ChatGroup> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Name).IsRequired().HasMaxLength(255);
    }
}

public class ChatGroupMemberConfiguration : IEntityTypeConfiguration<ChatGroupMember>
{
    public void Configure(EntityTypeBuilder<ChatGroupMember> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.GroupId, x.UserId }).IsUnique();

        b.HasOne(x => x.Group)
            .WithMany(g => g.Members)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ChatGroupMessageConfiguration : IEntityTypeConfiguration<ChatGroupMessage>
{
    public void Configure(EntityTypeBuilder<ChatGroupMessage> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Author).IsRequired().HasMaxLength(255);
        b.Property(x => x.Message).IsRequired();
        b.HasIndex(x => x.CreatedAt);

        b.HasOne(x => x.Group)
            .WithMany(g => g.Messages)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PrivateChatThreadConfiguration : IEntityTypeConfiguration<PrivateChatThread>
{
    public void Configure(EntityTypeBuilder<PrivateChatThread> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.HasIndex(x => new { x.Participant1Id, x.Participant2Id }).IsUnique();
        b.HasIndex(x => x.Participant1Id);
        b.HasIndex(x => x.Participant2Id);
    }
}

public class PrivateChatMessageConfiguration : IEntityTypeConfiguration<PrivateChatMessage>
{
    public void Configure(EntityTypeBuilder<PrivateChatMessage> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Author).IsRequired().HasMaxLength(255);
        b.Property(x => x.Message).IsRequired();
        b.HasIndex(x => x.CreatedAt);

        b.HasOne(x => x.Thread)
            .WithMany(t => t.Messages)
            .HasForeignKey(x => x.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
