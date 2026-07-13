using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class ForumCategory
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    /// <summary>Null = global category, not tied to a single course.</summary>
    public string? CourseId { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<ForumThread> Threads { get; set; } = new List<ForumThread>();
}

public class ForumThread
{
    public string Id { get; set; } = default!;
    public string CategoryId { get; set; } = default!;
    public string? CourseId { get; set; }
    public string Title { get; set; } = default!;
    public string Content { get; set; } = default!;
    /// <summary>Polymorphic: users.id or students.id.</summary>
    public string AuthorId { get; set; } = default!;
    public string AuthorName { get; set; } = default!;
    public ForumRole AuthorRole { get; set; }
    public bool IsPinned { get; set; }
    public bool IsLocked { get; set; }
    public int Views { get; set; }
    /// <summary>Denormalized counter maintained by ForumService.CreateReply.</summary>
    public int ReplyCount { get; set; }
    public DateTime? LastReplyAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ForumReply> Replies { get; set; } = new List<ForumReply>();
}

public class ForumReply
{
    public string Id { get; set; } = default!;
    public string ThreadId { get; set; } = default!;
    public string Content { get; set; } = default!;
    public string AuthorId { get; set; } = default!;
    public string AuthorName { get; set; } = default!;
    public ForumRole AuthorRole { get; set; }
    public bool IsSolution { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
