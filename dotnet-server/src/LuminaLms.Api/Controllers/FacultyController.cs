using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("faculty")]
[Authorize]
public class FacultyController : ControllerBase
{
    private readonly IStaffAccountService _staff;

    public FacultyController(IStaffAccountService staff)
    {
        _staff = staff;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StaffUserDto>>> GetAll(CancellationToken ct)
        => Ok(await _staff.GetAllAsync(UserRole.Faculty, ct));

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<StaffUserDto>> Create([FromBody] CreateStaffUserRequest request, CancellationToken ct)
        => StatusCode(201, await _staff.CreateAsync(UserRole.Faculty, request, ct));

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<StaffUserDto>> Update(string id, [FromBody] UpdateStaffUserRequest request, CancellationToken ct)
    {
        var faculty = await _staff.UpdateAsync(id, UserRole.Faculty, request, ct);
        return faculty is null ? NotFound(new { message = "Faculty not found" }) : Ok(faculty);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _staff.DeleteAsync(id, UserRole.Faculty, ct);
        return deleted ? NoContent() : NotFound(new { message = "Faculty not found" });
    }
}
