using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Username).IsRequired().HasMaxLength(255);
        b.Property(x => x.Email).IsRequired().HasMaxLength(255);
        b.Property(x => x.Name).IsRequired().HasMaxLength(255);
        b.Property(x => x.Password).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.Username).IsUnique();
        b.HasIndex(x => x.Email).IsUnique();
        b.HasIndex(x => x.Role);
    }
}

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Email).IsRequired().HasMaxLength(255);
        b.Property(x => x.Username).IsRequired().HasMaxLength(255);
        b.Property(x => x.Password).IsRequired().HasMaxLength(255);
        b.Property(x => x.FirstName).IsRequired().HasMaxLength(255);
        b.Property(x => x.LastName).IsRequired().HasMaxLength(255);
        b.Property(x => x.CourseFee).HasColumnType("decimal(10,2)");
        b.HasIndex(x => x.Email).IsUnique();
        b.HasIndex(x => x.Username).IsUnique();
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.ApplicationStatus);

        b.HasOne(x => x.Course)
            .WithMany(c => c.Students)
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
