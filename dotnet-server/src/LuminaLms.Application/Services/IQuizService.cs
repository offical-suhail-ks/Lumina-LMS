using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IQuizService
{
    Task<QuizDto> CreateQuizAsync(CreateQuizRequest request, CancellationToken ct = default);
    Task<QuizDto?> GetQuizByIdAsync(string id, bool includeQuestions, CancellationToken ct = default);
    Task<IReadOnlyList<QuizDto>> GetQuizzesByCourseAsync(string courseId, CancellationToken ct = default);
    Task<QuizQuestionDto> AddQuestionAsync(string quizId, AddQuestionRequest request, CancellationToken ct = default);
    Task<QuizQuestionOptionDto> AddQuestionOptionAsync(string questionId, AddQuestionOptionRequest request, CancellationToken ct = default);

    /// <summary>Throws InvalidOperationException("Maximum attempts reached") when the student has exhausted MaxAttempts.</summary>
    Task<QuizAttemptDto> StartAttemptAsync(string quizId, string studentId, CancellationToken ct = default);
    Task<QuizAnswerDto> SubmitAnswerAsync(string attemptId, string questionId, SubmitAnswerRequest request, CancellationToken ct = default);
    Task<QuizAttemptDto?> SubmitAttemptAsync(string attemptId, int? timeTaken, CancellationToken ct = default);
    Task<QuizAttemptResultsDto?> GetAttemptResultsAsync(string attemptId, CancellationToken ct = default);
}
