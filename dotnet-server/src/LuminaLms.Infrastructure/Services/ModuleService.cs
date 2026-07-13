using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class ModuleService : IModuleService
{
    private readonly LmsDbContext _db;

    public ModuleService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<CourseModuleDto>> GetAllByCourseAsync(string courseId, CancellationToken ct = default)
    {
        var modules = await _db.CourseModules.Include(m => m.Materials)
            .Where(m => m.CourseId == courseId).OrderBy(m => m.OrderIndex).ToListAsync(ct);
        return modules.Select(ToDto).ToList();
    }

    public async Task<CourseModuleDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var module = await _db.CourseModules.Include(m => m.Materials).FirstOrDefaultAsync(m => m.Id == id, ct);
        return module is null ? null : ToDto(module);
    }

    public async Task<CourseModuleDto> CreateAsync(string courseId, CreateModuleRequest request, CancellationToken ct = default)
    {
        var module = new CourseModule
        {
            Id = $"module-{Guid.NewGuid()}",
            CourseId = courseId,
            Title = request.Title,
            Description = request.Description,
            DurationHours = request.DurationHours,
            OrderIndex = request.OrderIndex,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.CourseModules.Add(module);
        await _db.SaveChangesAsync(ct);
        return ToDto(module);
    }

    public async Task<CourseModuleDto?> UpdateAsync(string id, UpdateModuleRequest request, CancellationToken ct = default)
    {
        var module = await _db.CourseModules.Include(m => m.Materials).FirstOrDefaultAsync(m => m.Id == id, ct);
        if (module is null) return null;

        if (request.Title is not null) module.Title = request.Title;
        if (request.OrderIndex is not null) module.OrderIndex = request.OrderIndex.Value;
        module.Description = request.Description;
        module.DurationHours = request.DurationHours;
        module.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(module);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
    {
        var rows = await _db.CourseModules.Where(m => m.Id == id).ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    public async Task<MaterialDto> AddMaterialAsync(string moduleId, AddMaterialRequest request, string? fileName, string? filePath, long? fileSize, string? fileType, CancellationToken ct = default)
    {
        var material = new ModuleMaterial
        {
            Id = $"material-{Guid.NewGuid()}",
            ModuleId = moduleId,
            Title = request.Title,
            FileName = fileName,
            FilePath = filePath,
            FileSize = fileSize,
            FileType = fileType,
            UploadedBy = request.UploadedBy,
            CreatedAt = DateTime.UtcNow,
        };
        _db.ModuleMaterials.Add(material);
        await _db.SaveChangesAsync(ct);
        return ToDto(material);
    }

    public async Task<bool> DeleteMaterialAsync(string materialId, CancellationToken ct = default)
    {
        var rows = await _db.ModuleMaterials.Where(m => m.Id == materialId).ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    private static MaterialDto ToDto(ModuleMaterial m) => new(m.Id, m.ModuleId, m.Title, m.FileName, m.FilePath, m.FileSize, m.FileType, m.UploadedBy, m.CreatedAt);

    private static CourseModuleDto ToDto(CourseModule m) => new(
        m.Id, m.CourseId, m.Title, m.Description, m.DurationHours, m.OrderIndex,
        m.Materials.Select(ToDto).ToList(), m.CreatedAt, m.UpdatedAt);
}
