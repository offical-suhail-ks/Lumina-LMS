namespace LuminaLms.Domain.Enums;

/// <summary>Backing enum for message_role_enum / forum_role_enum-shaped columns that mirror UserRole's value set.</summary>
public enum MessageRole
{
    Admin,
    Faculty,
    Student,
    Parent,
    Accounting
}

public enum AnnouncementAudience
{
    All,
    Students,
    Faculty,
    Parents
}

public enum QuizType
{
    Quiz,
    Exam,
    Assignment
}

public enum QuestionType
{
    MultipleChoice,
    TrueFalse,
    ShortAnswer,
    Essay
}

public enum QuizAttemptStatus
{
    InProgress,
    Submitted,
    Graded
}

public enum ForumRole
{
    Admin,
    Faculty,
    Student,
    Parent
}

public enum CertificateType
{
    CourseCompletion,
    Achievement,
    Participation
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error,
    Assignment,
    Grade,
    Announcement,
    Message
}

public enum VideoType
{
    Youtube,
    Vimeo,
    Upload,
    Embed
}

public enum AchievementType
{
    CourseCompletion,
    Assignment,
    Quiz,
    Attendance,
    Participation,
    Custom
}
