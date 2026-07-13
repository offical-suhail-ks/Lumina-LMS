using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("accounting-users")]
[Authorize(Roles = "admin")]
public class AccountingUsersController : ControllerBase
{
    private readonly IStaffAccountService _staff;

    public AccountingUsersController(IStaffAccountService staff)
    {
        _staff = staff;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StaffUserDto>>> GetAll(CancellationToken ct)
        => Ok(await _staff.GetAllAsync(UserRole.Accounting, ct));

    [HttpPost]
    public async Task<ActionResult<StaffUserDto>> Create([FromBody] CreateStaffUserRequest request, CancellationToken ct)
        => StatusCode(201, await _staff.CreateAsync(UserRole.Accounting, request, ct));

    [HttpPut("{id}")]
    public async Task<ActionResult<StaffUserDto>> Update(string id, [FromBody] UpdateStaffUserRequest request, CancellationToken ct)
    {
        var user = await _staff.UpdateAsync(id, UserRole.Accounting, request, ct);
        return user is null ? NotFound(new { message = "Accounting user not found" }) : Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var deleted = await _staff.DeleteAsync(id, UserRole.Accounting, ct);
        return deleted ? NoContent() : NotFound(new { message = "Accounting user not found" });
    }
}
