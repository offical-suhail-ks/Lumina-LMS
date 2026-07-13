
namespace LuminaLms.Application.Features.Forum;

public interface IForumService
{
    Task<ForumCategoryDto> CreateCategoryAsync(CreateForumCategoryRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ForumCategoryDto>> GetCategoriesByCourseAsync(string courseId, CancellationToken ct = default);

    Task<ForumThreadDto> CreateThreadAsync(CreateForumThreadRequest request, CancellationToken ct = default);
    /// <summary>Increments the thread's view count as a side effect, matching the source app.</summary>
    Task<ForumThreadDto?> GetThreadByIdAsync(string id, bool includeReplies, CancellationToken ct = default);
    Task<IReadOnlyList<ForumThreadDto>> GetThreadsByCategoryAsync(string categoryId, CancellationToken ct = default);

    Task<ForumReplyDto> CreateReplyAsync(CreateForumReplyRequest request, CancellationToken ct = default);
    Task<ForumReplyDto?> MarkAsSolutionAsync(string replyId, CancellationToken ct = default);
}
