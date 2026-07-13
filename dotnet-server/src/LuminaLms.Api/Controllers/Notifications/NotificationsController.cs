using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationsController(INotificationService notifications)
    {
        _notifications = notifications;
    }

    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Create([FromBody] CreateNotificationRequest request, CancellationToken ct)
        => StatusCode(201, await _notifications.CreateAsync(request, ct));

    [HttpGet("{userId}/{userType}")]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetByUser(string userId, string userType, [FromQuery] bool unreadOnly, [FromQuery] int? limit, CancellationToken ct)
        => Ok(await _notifications.GetByUserAsync(userId, userType, unreadOnly, limit, ct));

    [HttpGet("{userId}/{userType}/unread-count")]
    public async Task<IActionResult> GetUnreadCount(string userId, string userType, CancellationToken ct)
        => Ok(new { count = await _notifications.GetUnreadCountAsync(userId, userType, ct) });

    [HttpPost("{id}/read")]
    public async Task<ActionResult<NotificationDto>> MarkAsRead(string id, CancellationToken ct)
    {
        var notification = await _notifications.MarkAsReadAsync(id, ct);
        return notification is null ? NotFound(new { message = "Notification not found" }) : Ok(notification);
    }

    [HttpPost("{userId}/{userType}/read-all")]
    public async Task<IActionResult> MarkAllAsRead(string userId, string userType, CancellationToken ct)
    {
        await _notifications.MarkAllAsReadAsync(userId, userType, ct);
        return Ok(new { success = true });
    }
}
