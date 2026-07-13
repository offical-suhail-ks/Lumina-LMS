namespace LuminaLms.Application.Dtos;

public record ForumCategoryDto(string Id, string Name, string? Description, string? CourseId, int OrderIndex, DateTime CreatedAt);

public record ForumReplyDto(string Id, string ThreadId, string Content, string AuthorId, string AuthorName, string AuthorRole, bool IsSolution, DateTime CreatedAt, DateTime UpdatedAt);

public record ForumThreadDto(
    string Id, string CategoryId, string? CourseId, string Title, string Content, string AuthorId, string AuthorName,
    string AuthorRole, bool IsPinned, bool IsLocked, int Views, int ReplyCount, DateTime? LastReplyAt,
    DateTime CreatedAt, DateTime UpdatedAt, IReadOnlyList<ForumReplyDto>? Replies = null);

public class CreateForumCategoryRequest
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public string? CourseId { get; set; }
    public int OrderIndex { get; set; }
}

public class CreateForumThreadRequest
{
    public string CategoryId { get; set; } = default!;
    public string? CourseId { get; set; }
    public string Title { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string AuthorId { get; set; } = default!;
    public string AuthorName { get; set; } = default!;
    public string AuthorRole { get; set; } = default!;
}

public class CreateForumReplyRequest
{
    public string ThreadId { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string AuthorId { get; set; } = default!;
    public string AuthorName { get; set; } = default!;
    public string AuthorRole { get; set; } = default!;
}
