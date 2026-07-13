using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("achievements")]
[Authorize]
public class AchievementsController : ControllerBase
{
    private readonly IAchievementService _achievements;

    public AchievementsController(IAchievementService achievements)
    {
        _achievements = achievements;
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AchievementDto>> Create([FromBody] CreateAchievementRequest request, CancellationToken ct)
        => StatusCode(201, await _achievements.CreateAsync(request, ct));

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AchievementDto>>> GetAll(CancellationToken ct)
        => Ok(await _achievements.GetAllAsync(ct));

    [HttpGet("student/{studentId}")]
    public async Task<ActionResult<IReadOnlyList<StudentAchievementDto>>> GetByStudent(string studentId, CancellationToken ct)
        => Ok(await _achievements.GetStudentAchievementsAsync(studentId, ct));

    [HttpPost("{achievementId}/award/{studentId}")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<StudentAchievementDto>> Award(string achievementId, string studentId, CancellationToken ct)
        => StatusCode(201, await _achievements.AwardAsync(studentId, achievementId, ct));
}
