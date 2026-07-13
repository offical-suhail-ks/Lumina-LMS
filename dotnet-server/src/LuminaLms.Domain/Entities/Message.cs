using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Message
{
    public string Id { get; set; } = default!;
    /// <summary>Polymorphic: users.id or students.id.</summary>
    public string SenderId { get; set; } = default!;
    public string SenderName { get; set; } = default!;
    public MessageRole SenderRole { get; set; }
    public string? RecipientId { get; set; }
    public MessageRole? RecipientRole { get; set; }
    public string Subject { get; set; } = default!;
    public string Body { get; set; } = default!;
    public bool ReadBySender { get; set; } = true;
    public bool ReadByRecipient { get; set; }
    public bool DeletedBySender { get; set; }
    public bool DeletedByRecipient { get; set; }
    public bool IsAnnouncement { get; set; }
    public AnnouncementAudience? AnnouncementAudience { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
