using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("forum")]
[Authorize]
public class ForumController : ControllerBase
{
    private readonly IForumService _forum;

    public ForumController(IForumService forum)
    {
        _forum = forum;
    }

    [HttpPost("categories")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<ForumCategoryDto>> CreateCategory([FromBody] CreateForumCategoryRequest request, CancellationToken ct)
        => StatusCode(201, await _forum.CreateCategoryAsync(request, ct));

    [HttpGet("categories/course/{courseId}")]
    public async Task<ActionResult<IReadOnlyList<ForumCategoryDto>>> GetCategories(string courseId, CancellationToken ct)
        => Ok(await _forum.GetCategoriesByCourseAsync(courseId, ct));

    [HttpPost("threads")]
    public async Task<ActionResult<ForumThreadDto>> CreateThread([FromBody] CreateForumThreadRequest request, CancellationToken ct)
        => StatusCode(201, await _forum.CreateThreadAsync(request, ct));

    [HttpGet("threads/category/{categoryId}")]
    public async Task<ActionResult<IReadOnlyList<ForumThreadDto>>> GetThreads(string categoryId, CancellationToken ct)
        => Ok(await _forum.GetThreadsByCategoryAsync(categoryId, ct));

    [HttpGet("threads/{id}")]
    public async Task<ActionResult<ForumThreadDto>> GetThread(string id, CancellationToken ct)
    {
        var thread = await _forum.GetThreadByIdAsync(id, includeReplies: true, ct);
        return thread is null ? NotFound(new { message = "Thread not found" }) : Ok(thread);
    }

    [HttpPost("replies")]
    public async Task<ActionResult<ForumReplyDto>> CreateReply([FromBody] CreateForumReplyRequest request, CancellationToken ct)
        => StatusCode(201, await _forum.CreateReplyAsync(request, ct));

    [HttpPost("replies/{id}/solution")]
    public async Task<ActionResult<ForumReplyDto>> MarkAsSolution(string id, CancellationToken ct)
    {
        var reply = await _forum.MarkAsSolutionAsync(id, ct);
        return reply is null ? NotFound(new { message = "Reply not found" }) : Ok(reply);
    }
}
