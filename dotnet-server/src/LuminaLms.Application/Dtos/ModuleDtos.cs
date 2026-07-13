namespace LuminaLms.Application.Dtos;

public record MaterialDto(string Id, string ModuleId, string Title, string? FileName, string? FilePath, long? FileSize, string? FileType, string? UploadedBy, DateTime CreatedAt);

public record CourseModuleDto(string Id, string CourseId, string Title, string? Description, decimal? DurationHours, int OrderIndex, IReadOnlyList<MaterialDto> Materials, DateTime CreatedAt, DateTime UpdatedAt);

public class CreateModuleRequest
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public decimal? DurationHours { get; set; }
    public int OrderIndex { get; set; }
}

public class UpdateModuleRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? DurationHours { get; set; }
    public int? OrderIndex { get; set; }
}

public class AddMaterialRequest
{
    public string Title { get; set; } = default!;
    public string? UploadedBy { get; set; }
}
