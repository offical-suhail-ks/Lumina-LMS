using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("videos")]
[Authorize]
public class VideosController : ControllerBase
{
    private readonly IVideoService _videos;
    private readonly IFileStorageService _fileStorage;

    public VideosController(IVideoService videos, IFileStorageService fileStorage)
    {
        _videos = videos;
        _fileStorage = fileStorage;
    }

    [HttpPost]
    [Authorize(Roles = "admin,faculty")]
    [RequestSizeLimit(500L * 1024 * 1024)]
    public async Task<ActionResult<CourseVideoDto>> Add([FromForm] AddVideoRequest request, IFormFile? video, CancellationToken ct)
    {
        try
        {
            if (video is not null)
            {
                await using var stream = video.OpenReadStream();
                var stored = await _fileStorage.SaveVideoAsync(stream, video.FileName, video.ContentType, ct);
                request.VideoUrl = $"/uploads/{stored.RelativePath}";
                request.VideoType = "upload";
            }
            else if (string.IsNullOrWhiteSpace(request.VideoType))
            {
                request.VideoType = "youtube";
            }

            var result = await _videos.AddVideoAsync(request, ct);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<IReadOnlyList<CourseVideoDto>>> GetByCourse(string courseId, CancellationToken ct)
        => Ok(await _videos.GetByCourseAsync(courseId, ct));

    [HttpPost("{videoId}/progress")]
    [Authorize(Roles = "student")]
    public async Task<ActionResult<VideoProgressDto>> UpdateProgress(string videoId, [FromBody] UpdateVideoProgressRequest request, CancellationToken ct)
        => Ok(await _videos.UpdateProgressAsync(videoId, request, ct));

    [HttpGet("{videoId}/progress/{studentId}")]
    public async Task<ActionResult<VideoProgressDto>> GetProgress(string videoId, string studentId, CancellationToken ct)
    {
        var progress = await _videos.GetProgressAsync(videoId, studentId, ct);
        return progress is null ? NotFound() : Ok(progress);
    }
}
