using LuminaLms.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LuminaLms.Infrastructure.Persistence.Configurations;

public class CalendarEventConfiguration : IEntityTypeConfiguration<CalendarEvent>
{
    public void Configure(EntityTypeBuilder<CalendarEvent> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.HasIndex(x => x.EventDate);

        b.HasOne(x => x.Assignment)
            .WithMany()
            .HasForeignKey(x => x.AssignmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class AccountingTaskConfiguration : IEntityTypeConfiguration<AccountingTask>
{
    public void Configure(EntityTypeBuilder<AccountingTask> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Title).IsRequired().HasMaxLength(255);
        b.Property(x => x.StudentData).HasColumnType("jsonb");
        b.Property(x => x.FeeDetails).HasColumnType("jsonb");
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.TaskType);
        b.HasIndex(x => x.CreatedAt);

        b.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.AssignedToUser)
            .WithMany()
            .HasForeignKey(x => x.AssignedTo)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class SalaryConfiguration : IEntityTypeConfiguration<Salary>
{
    public void Configure(EntityTypeBuilder<Salary> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.BaseSalary).HasColumnType("decimal(10,2)");
        b.Property(x => x.Allowances).HasColumnType("decimal(10,2)");
        b.Property(x => x.Deductions).HasColumnType("decimal(10,2)");
        b.Property(x => x.NetSalary).HasColumnType("decimal(10,2)");
        b.HasIndex(x => x.EmployeeId);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.EmployeeType);

        b.HasOne(x => x.CreatedByUser)
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class SalaryPaymentConfiguration : IEntityTypeConfiguration<SalaryPayment>
{
    public void Configure(EntityTypeBuilder<SalaryPayment> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Amount).HasColumnType("decimal(10,2)");
        b.HasIndex(x => x.PaymentDate);
        b.HasIndex(x => x.Status);

        b.HasOne(x => x.Salary)
            .WithMany(s => s.Payments)
            .HasForeignKey(x => x.SalaryId)
            .OnDelete(DeleteBehavior.Cascade);

        b.HasOne(x => x.ProcessedByUser)
            .WithMany()
            .HasForeignKey(x => x.ProcessedBy)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> b)
    {
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever().HasMaxLength(255);
        b.Property(x => x.Amount).HasColumnType("decimal(10,2)");
        b.Property(x => x.PaymentMethod).HasMaxLength(50);
        b.Property(x => x.PaymentGateway).HasMaxLength(50);
        b.HasIndex(x => x.PaymentStatus);
        b.HasIndex(x => x.CreatedAt);

        b.HasOne(x => x.Student)
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
