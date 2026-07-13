using LuminaLms.Application.Common;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Features.Mailbox;

public class MailboxService : IMailboxService
{
    private readonly LmsDbContext _db;

    public MailboxService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<InboxDto> GetInboxAsync(string userId, string userRole, CancellationToken ct = default)
    {
        var roleAudience = RoleToAudience(userRole);

        var personal = await _db.Messages
            .Where(m => m.RecipientId == userId && !m.DeletedByRecipient)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        var announcements = await _db.Messages
            .Where(m => m.IsAnnouncement && (m.AnnouncementAudience == AnnouncementAudience.All || m.AnnouncementAudience == roleAudience))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        return new InboxDto(personal.Select(ToDto).ToList(), announcements.Select(m => ToDto(m) with { IsRead = false }).ToList());
    }

    public async Task<MessageDto?> GetMessageByIdAsync(string id, string userId, CancellationToken ct = default)
    {
        var message = await _db.Messages.FirstOrDefaultAsync(m => m.Id == id &&
            ((m.RecipientId == userId && !m.DeletedByRecipient) ||
             (m.SenderId == userId && !m.DeletedBySender) ||
             m.IsAnnouncement), ct);

        if (message is null) return null;

        if (message.RecipientId == userId && !message.ReadByRecipient)
        {
            message.ReadByRecipient = true;
            await _db.SaveChangesAsync(ct);
        }

        return ToDto(message);
    }

    public async Task<MessageDto> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default)
    {
        var message = new Message
        {
            Id = $"msg-{Guid.NewGuid()}",
            SenderId = request.SenderId,
            SenderName = request.SenderName,
            SenderRole = request.SenderRole.ToEnum<MessageRole>(),
            RecipientId = request.RecipientId,
            RecipientRole = request.RecipientRole.TryToEnum<MessageRole>(out var recipientRole) ? recipientRole : null,
            Subject = request.Subject,
            Body = request.Body,
            IsAnnouncement = request.IsAnnouncement,
            AnnouncementAudience = request.AnnouncementAudience.TryToEnum<AnnouncementAudience>(out var audience) ? audience : null,
            ReadBySender = true,
            ReadByRecipient = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Messages.Add(message);
        await _db.SaveChangesAsync(ct);
        return ToDto(message);
    }

    public async Task MarkAsReadAsync(string id, string userId, CancellationToken ct = default)
    {
        await _db.Messages.Where(m => m.Id == id && m.RecipientId == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ReadByRecipient, true), ct);
    }

    public async Task MarkAllAsReadAsync(string userId, CancellationToken ct = default)
    {
        await _db.Messages.Where(m => m.RecipientId == userId && !m.ReadByRecipient)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ReadByRecipient, true), ct);
    }

    public async Task<(bool Success, string? Error)> DeleteMessageAsync(string id, string userId, CancellationToken ct = default)
    {
        var message = await _db.Messages.FirstOrDefaultAsync(m => m.Id == id, ct);
        if (message is null) return (false, "Message not found");
        if (message.SenderId != userId && message.RecipientId != userId) return (false, "Unauthorized");

        if (message.SenderId == userId) message.DeletedBySender = true;
        else message.DeletedByRecipient = true;

        await _db.SaveChangesAsync(ct);
        return (true, null);
    }

    public async Task<IReadOnlyList<MessageDto>> GetSentMessagesAsync(string userId, CancellationToken ct = default)
    {
        var messages = await _db.Messages.Where(m => m.SenderId == userId).OrderByDescending(m => m.CreatedAt).ToListAsync(ct);
        return messages.Select(ToDto).ToList();
    }

    public async Task<UnreadCountDto> GetUnreadCountAsync(string userId, string userRole, CancellationToken ct = default)
    {
        var personalCount = await _db.Messages.CountAsync(m => m.RecipientId == userId && !m.ReadByRecipient && !m.DeletedByRecipient, ct);

        var roleAudience = RoleToAudience(userRole);
        var cutoff = DateTime.UtcNow.AddDays(-7);
        var announcementCount = await _db.Messages.CountAsync(m =>
            m.IsAnnouncement &&
            (m.AnnouncementAudience == AnnouncementAudience.All || m.AnnouncementAudience == roleAudience) &&
            m.CreatedAt > cutoff, ct);

        return new UnreadCountDto(personalCount, announcementCount, personalCount + announcementCount);
    }

    /// <summary>
    /// Maps a user role ("student"/"parent"/"faculty"/...) to the plural
    /// announcement_audience_enum value it targets. The source app compared the
    /// singular role directly against the plural enum ('student' vs 'students'),
    /// which meant student/parent-targeted announcements could never match —
    /// fixed here rather than ported as-is.
    /// </summary>
    private static AnnouncementAudience? RoleToAudience(string role) => role switch
    {
        "student" => AnnouncementAudience.Students,
        "parent" => AnnouncementAudience.Parents,
        "faculty" => AnnouncementAudience.Faculty,
        _ => null,
    };

    private static MessageDto ToDto(Message m) => new(
        m.Id, m.SenderId, m.SenderName, m.SenderRole.ToSnakeCase(), m.RecipientId, m.RecipientRole?.ToSnakeCase(),
        m.Subject, m.Body, m.ReadByRecipient, m.IsAnnouncement, m.AnnouncementAudience?.ToSnakeCase(), m.CreatedAt);
}
