using System.Text.Json;
using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.Academics;

public class CourseService : ICourseService
{
    private readonly LmsDbContext _db;

    public CourseService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CourseDto>> GetAllAsync(CancellationToken ct = default)
    {
        var courses = await _db.Courses.Include(c => c.Tags).Include(c => c.Enrollments)
            .OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        return courses.Select(ToDto).ToList();
    }

    public async Task<CourseDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var course = await _db.Courses.Include(c => c.Tags).Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
        return course is null ? null : ToDto(course);
    }

    public async Task<CourseDto> CreateAsync(CreateCourseRequest request, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var course = new Course
        {
            Id = $"course-{Guid.NewGuid()}",
            Title = request.Title,
            Description = request.Description,
            Instructor = request.Instructor,
            Department = request.Department,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalYears = request.TotalYears,
            Capacity = request.Capacity,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Courses.Add(course);

        foreach (var tag in request.Tags ?? [])
        {
            _db.CourseTags.Add(new CourseTag { CourseId = course.Id, Tag = tag, CreatedAt = DateTime.UtcNow });
        }
        foreach (var studentId in request.Enrolled ?? [])
        {
            _db.CourseEnrollments.Add(new CourseEnrollment { CourseId = course.Id, StudentId = studentId, EnrolledAt = DateTime.UtcNow });
        }

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return (await GetByIdAsync(course.Id, ct))!;
    }

    public async Task<CourseDto?> UpdateAsync(string id, JsonElement patch, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var course = await _db.Courses.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (course is null) return null;

        if (patch.GetString("title") is { } title) course.Title = title;
        if (patch.GetString("instructor") is { } instructor) course.Instructor = instructor;
        if (patch.Has("description")) course.Description = patch.GetString("description");
        if (patch.Has("department")) course.Department = patch.GetString("department");
        if (patch.Has("startDate")) course.StartDate = patch.GetDateOnly("startDate");
        if (patch.Has("endDate")) course.EndDate = patch.GetDateOnly("endDate");
        if (patch.Has("totalYears")) course.TotalYears = patch.GetInt("totalYears");
        if (patch.GetInt("capacity") is { } capacity) course.Capacity = capacity;
        course.UpdatedAt = DateTime.UtcNow;

        // Replace-all semantics for tags/enrolled, matching the source app: if the
        // array is present, all existing rows are deleted and re-inserted rather
        // than diffed (this resets enrolled_at timestamps on every edit that
        // touches `enrolled` — preserved here for behavioral parity).
        if (patch.TryGetProperty("tags", out var tagsEl) && tagsEl.ValueKind == JsonValueKind.Array)
        {
            await _db.CourseTags.Where(t => t.CourseId == id).ExecuteDeleteAsync(ct);
            foreach (var tagEl in tagsEl.EnumerateArray())
            {
                _db.CourseTags.Add(new CourseTag { CourseId = id, Tag = tagEl.GetString()!, CreatedAt = DateTime.UtcNow });
            }
        }
        if (patch.TryGetProperty("enrolled", out var enrolledEl) && enrolledEl.ValueKind == JsonValueKind.Array)
        {
            await _db.CourseEnrollments.Where(e => e.CourseId == id).ExecuteDeleteAsync(ct);
            foreach (var studentEl in enrolledEl.EnumerateArray())
            {
                _db.CourseEnrollments.Add(new CourseEnrollment { CourseId = id, StudentId = studentEl.GetString()!, EnrolledAt = DateTime.UtcNow });
            }
        }

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await _db.Courses.Where(c => c.Id == id).ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    public async Task<EnrollResult> EnrollAsync(string courseId, string studentId, CancellationToken ct = default)
    {
        var course = await _db.Courses.Include(c => c.Enrollments).FirstOrDefaultAsync(c => c.Id == courseId, ct);
        if (course is null) return EnrollResult.CourseNotFound;

        if (await _db.CourseEnrollments.AnyAsync(e => e.CourseId == courseId && e.StudentId == studentId, ct))
        {
            return EnrollResult.AlreadyEnrolled;
        }

        if (course.Enrollments.Count >= course.Capacity)
        {
            return EnrollResult.AtCapacity;
        }

        _db.CourseEnrollments.Add(new CourseEnrollment { CourseId = courseId, StudentId = studentId, EnrolledAt = DateTime.UtcNow });
        await _db.SaveChangesAsync(ct);
        return EnrollResult.Success;
    }

    public async Task<bool> UnenrollAsync(string courseId, string studentId, CancellationToken ct = default)
    {
        var rows = await _db.CourseEnrollments
            .Where(e => e.CourseId == courseId && e.StudentId == studentId)
            .ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    public async Task<IReadOnlyList<StudentCourseDto>> GetStudentCoursesAsync(string studentId, CancellationToken ct = default)
    {
        var enrollments = await _db.CourseEnrollments
            .Include(e => e.Course).ThenInclude(c => c!.Tags)
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync(ct);

        return enrollments.Where(e => e.Course is not null).Select(e => new StudentCourseDto(
            e.CourseId, e.EnrolledAt, e.Course!.Id, e.Course.Title, e.Course.Description, e.Course.Instructor,
            e.Course.Department, e.Course.StartDate, e.Course.EndDate, e.Course.TotalYears, e.Course.Capacity,
            e.Course.Tags.Select(t => t.Tag).ToList(), e.Course.CreatedAt, e.Course.UpdatedAt)).ToList();
    }

    private static CourseDto ToDto(Course c) => new(
        c.Id, c.Title, c.Description, c.Instructor, c.Department, c.StartDate, c.EndDate, c.TotalYears, c.Capacity,
        c.Tags.Select(t => t.Tag).ToList(), c.Enrollments.Select(e => e.StudentId).ToList(),
        c.CreatedAt, c.UpdatedAt);
}
