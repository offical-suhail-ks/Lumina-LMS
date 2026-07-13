using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.Instructor).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.Instructor);
        b.HasIndex(x => x.Department);
    }
}

public class CourseModuleConfiguration : IEntityTypeConfiguration<CourseModule>
{
    public void Configure(EntityTypeBuilder<CourseModule> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.DurationHours).HasColumnType("decimal(5,2)");
        b.HasIndex(x => x.OrderIndex);

        b.HasOne(x => x.Course)
            .WithMany(c => c.Modules)
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ModuleMaterialConfiguration : IEntityTypeConfiguration<ModuleMaterial>
{
    public void Configure(EntityTypeBuilder<ModuleMaterial> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.FilePath).HasMaxLength(500);

        b.HasOne(x => x.Module)
            .WithMany(m => m.Materials)
            .HasForeignKey(x => x.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CourseTagConfiguration : IEntityTypeConfiguration<CourseTag>
{
    public void Configure(EntityTypeBuilder<CourseTag> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Tag).IsRequired().HasMaxLength(100);
        b.HasIndex(x => x.Tag);
        b.HasIndex(x => new { x.CourseId, x.Tag }).IsUnique();

        b.HasOne(x => x.Course)
            .WithMany(c => c.Tags)
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CourseEnrollmentConfiguration : IEntityTypeConfiguration<CourseEnrollment>
{
    public void Configure(EntityTypeBuilder<CourseEnrollment> b)
    {
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.CourseId, x.StudentId }).IsUnique();

        b.HasOne(x => x.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
