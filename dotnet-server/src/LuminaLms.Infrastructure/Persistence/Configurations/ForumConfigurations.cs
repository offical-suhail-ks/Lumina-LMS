using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class ForumCategoryConfiguration : IEntityTypeConfiguration<ForumCategory>
{
    public void Configure(EntityTypeBuilder<ForumCategory> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Name).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.CourseId);
    }
}

public class ForumThreadConfiguration : IEntityTypeConfiguration<ForumThread>
{
    public void Configure(EntityTypeBuilder<ForumThread> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.Content).IsRequired();
        b.Property(x => x.AuthorName).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.CategoryId);
        b.HasIndex(x => x.CourseId);
        b.HasIndex(x => x.AuthorId);
        b.HasIndex(x => x.IsPinned);
        b.HasIndex(x => x.CreatedAt);

        b.HasOne<ForumCategory>()
            .WithMany(c => c.Threads)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ForumReplyConfiguration : IEntityTypeConfiguration<ForumReply>
{
    public void Configure(EntityTypeBuilder<ForumReply> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Content).IsRequired();
        b.Property(x => x.AuthorName).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.ThreadId);
        b.HasIndex(x => x.AuthorId);
        b.HasIndex(x => x.CreatedAt);

        b.HasOne<ForumThread>()
            .WithMany(t => t.Replies)
            .HasForeignKey(x => x.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
