using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Quiz
{
    public string Id { get; set; } = default!;
    /// <summary>No FK enforced in source schema.</summary>
    public string CourseId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public QuizType QuizType { get; set; } = QuizType.Quiz;
    public int? TimeLimit { get; set; }
    /// <summary>Denormalized cache, kept in sync when questions are added (see QuizService.AddQuestion).</summary>
    public decimal TotalPoints { get; set; }
    public decimal? PassingScore { get; set; }
    public bool AllowRetake { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public bool ShuffleQuestions { get; set; }
    public bool ShowResults { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string CreatedBy { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
}

public class QuizQuestion
{
    public string Id { get; set; } = default!;
    public string QuizId { get; set; } = default!;
    public string QuestionText { get; set; } = default!;
    public QuestionType QuestionType { get; set; }
    public decimal Points { get; set; } = 1.00m;
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<QuizQuestionOption> Options { get; set; } = new List<QuizQuestionOption>();
}

public class QuizQuestionOption
{
    public string Id { get; set; } = default!;
    public string QuestionId { get; set; } = default!;
    public string OptionText { get; set; } = default!;
    public bool IsCorrect { get; set; }
    public int OrderIndex { get; set; }
}

public class QuizAttempt
{
    public string Id { get; set; } = default!;
    public string QuizId { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public int AttemptNumber { get; set; } = 1;
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public int? TimeTaken { get; set; }
    public decimal? Score { get; set; }
    public decimal? Percentage { get; set; }
    public bool? Passed { get; set; }
    public QuizAttemptStatus Status { get; set; } = QuizAttemptStatus.InProgress;

    public ICollection<QuizAnswer> Answers { get; set; } = new List<QuizAnswer>();
}

public class QuizAnswer
{
    public string Id { get; set; } = default!;
    public string AttemptId { get; set; } = default!;
    public string QuestionId { get; set; } = default!;
    public string? AnswerText { get; set; }
    /// <summary>JSON array of selected option ids, kept as text to match source.</summary>
    public string? SelectedOptions { get; set; }
    public decimal PointsEarned { get; set; }
    public bool? IsCorrect { get; set; }
    public DateTime? GradedAt { get; set; }
    public string? GradedBy { get; set; }
}
