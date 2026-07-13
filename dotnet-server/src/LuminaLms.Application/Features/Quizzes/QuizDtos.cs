namespace LuminaLms.Application.Features.Quizzes;

public record QuizQuestionOptionDto(string Id, string QuestionId, string OptionText, bool IsCorrect, int OrderIndex);

public record QuizQuestionDto(string Id, string QuizId, string QuestionText, string QuestionType, decimal Points, int OrderIndex, IReadOnlyList<QuizQuestionOptionDto> Options);

public record QuizDto(
    string Id, string CourseId, string Title, string? Description, string QuizType, int? TimeLimit,
    decimal TotalPoints, decimal? PassingScore, bool AllowRetake, int MaxAttempts, bool ShuffleQuestions,
    bool ShowResults, DateTime? StartDate, DateTime? EndDate, string CreatedBy, DateTime CreatedAt, DateTime UpdatedAt,
    IReadOnlyList<QuizQuestionDto>? Questions = null);

public class CreateQuizRequest
{
    public string CourseId { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string QuizType { get; set; } = "quiz";
    public int? TimeLimit { get; set; }
    public decimal? PassingScore { get; set; }
    public bool AllowRetake { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public bool ShuffleQuestions { get; set; }
    public bool ShowResults { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string CreatedBy { get; set; } = default!;
}

public class AddQuestionRequest
{
    public string QuestionText { get; set; } = default!;
    public string QuestionType { get; set; } = default!;
    public decimal Points { get; set; } = 1;
    public int OrderIndex { get; set; }
}

public class AddQuestionOptionRequest
{
    public string OptionText { get; set; } = default!;
    public bool IsCorrect { get; set; }
    public int OrderIndex { get; set; }
}

public record QuizAttemptDto(string Id, string QuizId, string StudentId, int AttemptNumber, DateTime StartedAt,
    DateTime? SubmittedAt, int? TimeTaken, decimal? Score, decimal? Percentage, bool? Passed, string Status);

public record QuizAnswerDto(string Id, string AttemptId, string QuestionId, string? AnswerText, IReadOnlyList<string>? SelectedOptions, decimal PointsEarned, bool? IsCorrect);

public class SubmitAnswerRequest
{
    public string? AnswerText { get; set; }
    public List<string>? SelectedOptions { get; set; }
}

public record QuizAttemptResultsDto(QuizAttemptDto Attempt, QuizDto Quiz, IReadOnlyList<QuizQuestionWithAnswerDto> Questions);

public record QuizQuestionWithAnswerDto(string Id, string QuizId, string QuestionText, string QuestionType, decimal Points, int OrderIndex, IReadOnlyList<QuizQuestionOptionDto> Options, QuizAnswerDto? Answer);
