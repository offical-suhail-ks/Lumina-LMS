using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("mailbox")]
[Authorize]
public class MailboxController : ControllerBase
{
    private readonly IMailboxService _mailbox;

    public MailboxController(IMailboxService mailbox)
    {
        _mailbox = mailbox;
    }

    [HttpGet("inbox")]
    public async Task<ActionResult<InboxDto>> GetInbox([FromQuery] string? userId, [FromQuery] string? userRole, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(userRole))
        {
            return BadRequest(new { message = "userId and userRole are required" });
        }
        return Ok(await _mailbox.GetInboxAsync(userId, userRole, ct));
    }

    [HttpGet("messages/{id}")]
    public async Task<ActionResult<MessageDto>> GetMessage(string id, [FromQuery] string? userId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { message = "userId is required" });
        }
        var message = await _mailbox.GetMessageByIdAsync(id, userId, ct);
        return message is null ? NotFound(new { message = "Message not found" }) : Ok(message);
    }

    [HttpPost("send")]
    public async Task<ActionResult<MessageDto>> Send([FromBody] SendMessageRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.SenderId) || string.IsNullOrWhiteSpace(request.SenderName) ||
            string.IsNullOrWhiteSpace(request.SenderRole) || string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Body))
        {
            return BadRequest(new { message = "Missing required fields" });
        }
        if (!request.IsAnnouncement && string.IsNullOrWhiteSpace(request.RecipientId))
        {
            return BadRequest(new { message = "recipientId is required for personal messages" });
        }
        if (request.IsAnnouncement && string.IsNullOrWhiteSpace(request.AnnouncementAudience))
        {
            return BadRequest(new { message = "announcementAudience is required for announcements" });
        }

        var message = await _mailbox.SendMessageAsync(request, ct);
        return StatusCode(201, message);
    }

    [HttpPost("messages/{id}/read")]
    public async Task<IActionResult> MarkAsRead(string id, [FromBody] MailboxUserRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            return BadRequest(new { message = "userId is required" });
        }
        await _mailbox.MarkAsReadAsync(id, request.UserId, ct);
        return Ok(new { success = true });
    }

    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead([FromBody] MailboxUserRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            return BadRequest(new { message = "userId is required" });
        }
        await _mailbox.MarkAllAsReadAsync(request.UserId, ct);
        return Ok(new { success = true });
    }

    [HttpDelete("messages/{id}")]
    public async Task<IActionResult> Delete(string id, [FromQuery] string? userId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { message = "userId is required" });
        }
        var (success, error) = await _mailbox.DeleteMessageAsync(id, userId, ct);
        return success ? Ok(new { success = true }) : BadRequest(new { message = error });
    }

    [HttpGet("sent")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> GetSent([FromQuery] string? userId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { message = "userId is required" });
        }
        return Ok(await _mailbox.GetSentMessagesAsync(userId, ct));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountDto>> GetUnreadCount([FromQuery] string? userId, [FromQuery] string? userRole, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(userRole))
        {
            return BadRequest(new { message = "userId and userRole are required" });
        }
        return Ok(await _mailbox.GetUnreadCountAsync(userId, userRole, ct));
    }
}

public class MailboxUserRequest
{
    public string? UserId { get; set; }
}
