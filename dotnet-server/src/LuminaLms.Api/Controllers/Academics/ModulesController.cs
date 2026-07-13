using LuminaLms.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Authorize]
public class ModulesController : ControllerBase
{
    private readonly IModuleService _modules;
    private readonly IFileStorageService _fileStorage;

    public ModulesController(IModuleService modules, IFileStorageService fileStorage)
    {
        _modules = modules;
        _fileStorage = fileStorage;
    }

    [HttpGet("courses/{courseId}/modules")]
    public async Task<ActionResult<IReadOnlyList<CourseModuleDto>>> GetByCourse(string courseId, CancellationToken ct)
        => Ok(await _modules.GetAllByCourseAsync(courseId, ct));

    [HttpPost("courses/{courseId}/modules")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CourseModuleDto>> Create(string courseId, [FromForm] CreateModuleRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Module title is required" });
        }
        var module = await _modules.CreateAsync(courseId, request, ct);
        return StatusCode(201, module);
    }

    [HttpPut("modules/{id}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CourseModuleDto>> Update(string id, [FromBody] UpdateModuleRequest request, CancellationToken ct)
    {
        var module = await _modules.UpdateAsync(id, request, ct);
        return module is null ? NotFound(new { message = "Module not found" }) : Ok(module);
    }

    [HttpDelete("modules/{id}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _modules.DeleteAsync(id, ct);
        return deleted ? Ok(new { message = "Module deleted successfully" }) : NotFound(new { message = "Module not found" });
    }

    [HttpPost("modules/{moduleId}/materials")]
    [Authorize(Roles = "admin,faculty")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<MaterialDto>> AddMaterial(string moduleId, [FromForm] AddMaterialRequest request, IFormFile? file, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Material title is required" });
        }

        string? fileName = null, filePath = null, fileType = null;
        long? fileSize = null;
        if (file is not null)
        {
            await using var stream = file.OpenReadStream();
            var stored = await _fileStorage.SaveModuleFileAsync(stream, file.FileName, file.ContentType, ct);
            fileName = file.FileName;
            filePath = $"/uploads/{stored.RelativePath}";
            fileSize = stored.Size;
            fileType = file.ContentType;
        }

        var material = await _modules.AddMaterialAsync(moduleId, request, fileName, filePath, fileSize, fileType, ct);
        return StatusCode(201, material);
    }

    [HttpDelete("modules/materials/{id}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<IActionResult> DeleteMaterial(string id, CancellationToken ct)
    {
        var deleted = await _modules.DeleteMaterialAsync(id, ct);
        return deleted ? Ok(new { message = "Material deleted successfully" }) : NotFound(new { message = "Material not found" });
    }
}
