using System.Text.Json;
using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface ICourseService
{
    Task<IReadOnlyList<CourseDto>> GetAllAsync(CancellationToken ct = default);
    Task<CourseDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<CourseDto> CreateAsync(CreateCourseRequest request, CancellationToken ct = default);
    Task<CourseDto?> UpdateAsync(string id, JsonElement patch, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);

    Task<EnrollResult> EnrollAsync(string courseId, string studentId, CancellationToken ct = default);
    Task<bool> UnenrollAsync(string courseId, string studentId, CancellationToken ct = default);
    Task<IReadOnlyList<StudentCourseDto>> GetStudentCoursesAsync(string studentId, CancellationToken ct = default);
}

public enum EnrollResult { Success, CourseNotFound, AlreadyEnrolled, AtCapacity }
