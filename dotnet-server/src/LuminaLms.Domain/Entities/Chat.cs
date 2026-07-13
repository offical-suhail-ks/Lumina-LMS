namespace LuminaLms.Domain.Entities;

public class ChatGroup
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ChatGroupMember> Members { get; set; } = new List<ChatGroupMember>();
    public ICollection<ChatGroupMessage> Messages { get; set; } = new List<ChatGroupMessage>();
}

public class ChatGroupMember
{
    public int Id { get; set; }
    public string GroupId { get; set; } = default!;
    public ChatGroup? Group { get; set; }
    /// <summary>Polymorphic: users.id or students.id.</summary>
    public string UserId { get; set; } = default!;
    public DateTime JoinedAt { get; set; }
}

public class ChatGroupMessage
{
    public string Id { get; set; } = default!;
    public string GroupId { get; set; } = default!;
    public ChatGroup? Group { get; set; }
    public string UserId { get; set; } = default!;
    public string Author { get; set; } = default!;
    public string Message { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}

public class PrivateChatThread
{
    public string Id { get; set; } = default!;
    public string Participant1Id { get; set; } = default!;
    public string Participant2Id { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<PrivateChatMessage> Messages { get; set; } = new List<PrivateChatMessage>();
}

public class PrivateChatMessage
{
    public string Id { get; set; } = default!;
    public string ThreadId { get; set; } = default!;
    public PrivateChatThread? Thread { get; set; }
    public string UserId { get; set; } = default!;
    public string Author { get; set; } = default!;
    public string Message { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
