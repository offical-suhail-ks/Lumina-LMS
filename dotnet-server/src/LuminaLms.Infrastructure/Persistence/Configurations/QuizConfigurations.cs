using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.TotalPoints).HasColumnType("decimal(10,2)");
        b.Property(x => x.PassingScore).HasColumnType("decimal(5,2)");
        b.HasIndex(x => x.CourseId);
        b.HasIndex(x => x.CreatedBy);
        b.HasIndex(x => new { x.StartDate, x.EndDate });
    }
}

public class QuizQuestionConfiguration : IEntityTypeConfiguration<QuizQuestion>
{
    public void Configure(EntityTypeBuilder<QuizQuestion> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.QuestionText).IsRequired();
        b.Property(x => x.Points).HasColumnType("decimal(10,2)");
        b.HasIndex(x => x.QuizId);
        b.HasIndex(x => x.OrderIndex);

        b.HasOne<Quiz>()
            .WithMany(q => q.Questions)
            .HasForeignKey(x => x.QuizId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuizQuestionOptionConfiguration : IEntityTypeConfiguration<QuizQuestionOption>
{
    public void Configure(EntityTypeBuilder<QuizQuestionOption> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.OptionText).IsRequired();
        b.HasIndex(x => x.QuestionId);

        b.HasOne<QuizQuestion>()
            .WithMany(q => q.Options)
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
{
    public void Configure(EntityTypeBuilder<QuizAttempt> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Score).HasColumnType("decimal(10,2)");
        b.Property(x => x.Percentage).HasColumnType("decimal(5,2)");
        b.HasIndex(x => x.QuizId);
        b.HasIndex(x => x.StudentId);
        b.HasIndex(x => x.Status);

        b.HasOne<Quiz>()
            .WithMany()
            .HasForeignKey(x => x.QuizId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class QuizAnswerConfiguration : IEntityTypeConfiguration<QuizAnswer>
{
    public void Configure(EntityTypeBuilder<QuizAnswer> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.PointsEarned).HasColumnType("decimal(10,2)");
        b.HasIndex(x => x.AttemptId);
        b.HasIndex(x => x.QuestionId);
        // Source schema is missing this constraint despite the app needing upsert-by
        // (attempt_id, question_id) semantics — added here to make that operation safe.
        b.HasIndex(x => new { x.AttemptId, x.QuestionId }).IsUnique();

        b.HasOne<QuizAttempt>()
            .WithMany(a => a.Answers)
            .HasForeignKey(x => x.AttemptId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
