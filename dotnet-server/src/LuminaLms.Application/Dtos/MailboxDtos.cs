namespace LuminaLms.Application.Dtos;

public record MessageDto(
    string Id, string SenderId, string SenderName, string SenderRole, string? RecipientId, string? RecipientRole,
    string Subject, string Body, bool IsRead, bool IsAnnouncement, string? AnnouncementAudience, DateTime CreatedAt);

public record InboxDto(IReadOnlyList<MessageDto> Personal, IReadOnlyList<MessageDto> Announcements);

public record UnreadCountDto(int Personal, int Announcements, int Total);

public class SendMessageRequest
{
    public string SenderId { get; set; } = default!;
    public string SenderName { get; set; } = default!;
    public string SenderRole { get; set; } = default!;
    public string? RecipientId { get; set; }
    public string? RecipientRole { get; set; }
    public string Subject { get; set; } = default!;
    public string Body { get; set; } = default!;
    public bool IsAnnouncement { get; set; }
    public string? AnnouncementAudience { get; set; }
}
