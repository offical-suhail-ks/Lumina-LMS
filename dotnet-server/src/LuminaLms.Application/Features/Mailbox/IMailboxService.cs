
namespace LuminaLms.Application.Features.Mailbox;

public interface IMailboxService
{
    Task<InboxDto> GetInboxAsync(string userId, string userRole, CancellationToken ct = default);
    Task<MessageDto?> GetMessageByIdAsync(string id, string userId, CancellationToken ct = default);
    Task<MessageDto> SendMessageAsync(SendMessageRequest request, CancellationToken ct = default);
    Task MarkAsReadAsync(string id, string userId, CancellationToken ct = default);
    Task MarkAllAsReadAsync(string userId, CancellationToken ct = default);
    Task<(bool Success, string? Error)> DeleteMessageAsync(string id, string userId, CancellationToken ct = default);
    Task<IReadOnlyList<MessageDto>> GetSentMessagesAsync(string userId, CancellationToken ct = default);
    Task<UnreadCountDto> GetUnreadCountAsync(string userId, string userRole, CancellationToken ct = default);
}
