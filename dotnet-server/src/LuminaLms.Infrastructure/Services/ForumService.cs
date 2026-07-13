using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class ForumService : IForumService
{
    private readonly LmsDbContext _db;

    public ForumService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<ForumCategoryDto> CreateCategoryAsync(CreateForumCategoryRequest request, CancellationToken ct = default)
    {
        var category = new ForumCategory
        {
            Id = $"cat-{Guid.NewGuid()}",
            Name = request.Name,
            Description = request.Description,
            CourseId = request.CourseId,
            OrderIndex = request.OrderIndex,
            CreatedAt = DateTime.UtcNow,
        };
        _db.ForumCategories.Add(category);
        await _db.SaveChangesAsync(ct);
        return ToDto(category);
    }

    public async Task<IReadOnlyList<ForumCategoryDto>> GetCategoriesByCourseAsync(string courseId, CancellationToken ct = default)
    {
        var categories = await _db.ForumCategories
            .Where(c => c.CourseId == courseId || c.CourseId == null)
            .OrderBy(c => c.OrderIndex).ThenBy(c => c.Name)
            .ToListAsync(ct);
        return categories.Select(ToDto).ToList();
    }

    public async Task<ForumThreadDto> CreateThreadAsync(CreateForumThreadRequest request, CancellationToken ct = default)
    {
        var thread = new ForumThread
        {
            Id = $"thread-{Guid.NewGuid()}",
            CategoryId = request.CategoryId,
            CourseId = request.CourseId,
            Title = request.Title,
            Content = request.Content,
            AuthorId = request.AuthorId,
            AuthorName = request.AuthorName,
            AuthorRole = request.AuthorRole.ToEnum<ForumRole>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.ForumThreads.Add(thread);
        await _db.SaveChangesAsync(ct);
        return ToDto(thread);
    }

    public async Task<ForumThreadDto?> GetThreadByIdAsync(string id, bool includeReplies, CancellationToken ct = default)
    {
        var thread = await _db.ForumThreads.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (thread is null) return null;

        thread.Views += 1;
        await _db.SaveChangesAsync(ct);

        IReadOnlyList<ForumReplyDto>? replies = null;
        if (includeReplies)
        {
            var replyEntities = await _db.ForumReplies.Where(r => r.ThreadId == id).OrderBy(r => r.CreatedAt).ToListAsync(ct);
            replies = replyEntities.Select(ToDto).ToList();
        }

        return ToDto(thread, replies);
    }

    public async Task<IReadOnlyList<ForumThreadDto>> GetThreadsByCategoryAsync(string categoryId, CancellationToken ct = default)
    {
        var threads = await _db.ForumThreads.Where(t => t.CategoryId == categoryId)
            .OrderByDescending(t => t.IsPinned).ThenByDescending(t => t.LastReplyAt).ThenByDescending(t => t.CreatedAt)
            .ToListAsync(ct);
        return threads.Select(t => ToDto(t)).ToList();
    }

    public async Task<ForumReplyDto> CreateReplyAsync(CreateForumReplyRequest request, CancellationToken ct = default)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var reply = new ForumReply
        {
            Id = $"reply-{Guid.NewGuid()}",
            ThreadId = request.ThreadId,
            Content = request.Content,
            AuthorId = request.AuthorId,
            AuthorName = request.AuthorName,
            AuthorRole = request.AuthorRole.ToEnum<ForumRole>(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.ForumReplies.Add(reply);

        await _db.ForumThreads.Where(t => t.Id == request.ThreadId)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.ReplyCount, t => t.ReplyCount + 1).SetProperty(t => t.LastReplyAt, DateTime.UtcNow), ct);

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return ToDto(reply);
    }

    public async Task<ForumReplyDto?> MarkAsSolutionAsync(string replyId, CancellationToken ct = default)
    {
        var reply = await _db.ForumReplies.FirstOrDefaultAsync(r => r.Id == replyId, ct);
        if (reply is null) return null;

        await _db.ForumReplies.Where(r => r.ThreadId == reply.ThreadId)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.IsSolution, false), ct);

        reply.IsSolution = true;
        await _db.SaveChangesAsync(ct);
        return ToDto(reply);
    }

    private static ForumCategoryDto ToDto(ForumCategory c) => new(c.Id, c.Name, c.Description, c.CourseId, c.OrderIndex, c.CreatedAt);

    private static ForumReplyDto ToDto(ForumReply r) => new(r.Id, r.ThreadId, r.Content, r.AuthorId, r.AuthorName, r.AuthorRole.ToSnakeCase(), r.IsSolution, r.CreatedAt, r.UpdatedAt);

    private static ForumThreadDto ToDto(ForumThread t, IReadOnlyList<ForumReplyDto>? replies = null) => new(
        t.Id, t.CategoryId, t.CourseId, t.Title, t.Content, t.AuthorId, t.AuthorName, t.AuthorRole.ToSnakeCase(),
        t.IsPinned, t.IsLocked, t.Views, t.ReplyCount, t.LastReplyAt, t.CreatedAt, t.UpdatedAt, replies);
}
