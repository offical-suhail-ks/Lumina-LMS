
namespace LuminaLms.Application.Features.Academics;

public interface IModuleService
{
    Task<IReadOnlyList<CourseModuleDto>> GetAllByCourseAsync(string courseId, CancellationToken ct = default);
    Task<CourseModuleDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<CourseModuleDto> CreateAsync(string courseId, CreateModuleRequest request, CancellationToken ct = default);
    Task<CourseModuleDto?> UpdateAsync(string id, UpdateModuleRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, CancellationToken ct = default);

    Task<MaterialDto> AddMaterialAsync(string moduleId, AddMaterialRequest request, string? fileName, string? filePath, long? fileSize, string? fileType, CancellationToken ct = default);
    Task<bool> DeleteMaterialAsync(string materialId, CancellationToken ct = default);
}
