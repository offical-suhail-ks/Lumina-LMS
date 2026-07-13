using System.Text.Json;
using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class QuizService : IQuizService
{
    private readonly LmsDbContext _db;

    public QuizService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<QuizDto> CreateQuizAsync(CreateQuizRequest request, CancellationToken ct = default)
    {
        var quiz = new Quiz
        {
            Id = $"quiz-{Guid.NewGuid()}",
            CourseId = request.CourseId,
            Title = request.Title,
            Description = request.Description,
            QuizType = request.QuizType.ToEnum<QuizType>(),
            TimeLimit = request.TimeLimit,
            TotalPoints = 0,
            PassingScore = request.PassingScore,
            AllowRetake = request.AllowRetake,
            MaxAttempts = request.MaxAttempts,
            ShuffleQuestions = request.ShuffleQuestions,
            ShowResults = request.ShowResults,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Quizzes.Add(quiz);
        await _db.SaveChangesAsync(ct);
        return ToDto(quiz);
    }

    public async Task<QuizDto?> GetQuizByIdAsync(string id, bool includeQuestions, CancellationToken ct = default)
    {
        var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.Id == id, ct);
        if (quiz is null) return null;

        IReadOnlyList<QuizQuestionDto>? questions = null;
        if (includeQuestions)
        {
            questions = await GetQuestionsByQuizAsync(id, ct);
        }
        return ToDto(quiz, questions);
    }

    public async Task<IReadOnlyList<QuizDto>> GetQuizzesByCourseAsync(string courseId, CancellationToken ct = default)
    {
        var quizzes = await _db.Quizzes.Where(q => q.CourseId == courseId).OrderByDescending(q => q.CreatedAt).ToListAsync(ct);
        return quizzes.Select(q => ToDto(q)).ToList();
    }

    public async Task<QuizQuestionDto> AddQuestionAsync(string quizId, AddQuestionRequest request, CancellationToken ct = default)
    {
        var question = new QuizQuestion
        {
            Id = $"q-{Guid.NewGuid()}",
            QuizId = quizId,
            QuestionText = request.QuestionText,
            QuestionType = request.QuestionType.ToEnum<QuestionType>(),
            Points = request.Points,
            OrderIndex = request.OrderIndex,
            CreatedAt = DateTime.UtcNow,
        };
        _db.QuizQuestions.Add(question);
        await _db.SaveChangesAsync(ct);

        // Total points is a denormalized cache kept in sync on every question add,
        // matching the source app's write-time recompute (see quizService.addQuestion).
        var totalPoints = await _db.QuizQuestions.Where(q => q.QuizId == quizId).SumAsync(q => q.Points, ct);
        await _db.Quizzes.Where(q => q.Id == quizId).ExecuteUpdateAsync(s => s.SetProperty(q => q.TotalPoints, totalPoints), ct);

        return new QuizQuestionDto(question.Id, question.QuizId, question.QuestionText, question.QuestionType.ToSnakeCase(), question.Points, question.OrderIndex, []);
    }

    public async Task<QuizQuestionOptionDto> AddQuestionOptionAsync(string questionId, AddQuestionOptionRequest request, CancellationToken ct = default)
    {
        var option = new QuizQuestionOption
        {
            Id = $"opt-{Guid.NewGuid()}",
            QuestionId = questionId,
            OptionText = request.OptionText,
            IsCorrect = request.IsCorrect,
            OrderIndex = request.OrderIndex,
        };
        _db.QuizQuestionOptions.Add(option);
        await _db.SaveChangesAsync(ct);
        return ToDto(option);
    }

    public async Task<QuizAttemptDto> StartAttemptAsync(string quizId, string studentId, CancellationToken ct = default)
    {
        var existingAttempts = await _db.QuizAttempts.CountAsync(a => a.QuizId == quizId && a.StudentId == studentId, ct);
        var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId, ct)
            ?? throw new KeyNotFoundException("Quiz not found");

        var attemptNumber = existingAttempts + 1;
        if (quiz.MaxAttempts > 0 && attemptNumber > quiz.MaxAttempts)
        {
            throw new InvalidOperationException("Maximum attempts reached");
        }

        var attempt = new QuizAttempt
        {
            Id = $"attempt-{Guid.NewGuid()}",
            QuizId = quizId,
            StudentId = studentId,
            AttemptNumber = attemptNumber,
            StartedAt = DateTime.UtcNow,
            Status = QuizAttemptStatus.InProgress,
        };
        _db.QuizAttempts.Add(attempt);
        await _db.SaveChangesAsync(ct);
        return ToDto(attempt);
    }

    public async Task<QuizAnswerDto> SubmitAnswerAsync(string attemptId, string questionId, SubmitAnswerRequest request, CancellationToken ct = default)
    {
        var question = await _db.QuizQuestions.FirstOrDefaultAsync(q => q.Id == questionId, ct)
            ?? throw new KeyNotFoundException("Question not found");

        bool? isCorrect = null;
        decimal pointsEarned = 0;

        if (question.QuestionType is QuestionType.MultipleChoice or QuestionType.TrueFalse)
        {
            var correctOptionIds = await _db.QuizQuestionOptions
                .Where(o => o.QuestionId == questionId && o.IsCorrect)
                .Select(o => o.Id).OrderBy(id => id).ToListAsync(ct);
            var selectedIds = (request.SelectedOptions ?? []).OrderBy(id => id).ToList();

            isCorrect = correctOptionIds.SequenceEqual(selectedIds);
            pointsEarned = isCorrect.Value ? question.Points : 0;
        }

        var selectedOptionsJson = request.SelectedOptions is null ? null : JsonSerializer.Serialize(request.SelectedOptions);

        // Real upsert on (attempt_id, question_id) — the source app's MySQL
        // `ON DUPLICATE KEY UPDATE` doesn't translate to Postgres and had no
        // backing unique constraint; both are fixed here (see QuizAnswerConfiguration).
        var existing = await _db.QuizAnswers.FirstOrDefaultAsync(a => a.AttemptId == attemptId && a.QuestionId == questionId, ct);
        if (existing is not null)
        {
            existing.AnswerText = request.AnswerText;
            existing.SelectedOptions = selectedOptionsJson;
            existing.PointsEarned = pointsEarned;
            existing.IsCorrect = isCorrect;
        }
        else
        {
            existing = new QuizAnswer
            {
                Id = $"answer-{Guid.NewGuid()}",
                AttemptId = attemptId,
                QuestionId = questionId,
                AnswerText = request.AnswerText,
                SelectedOptions = selectedOptionsJson,
                PointsEarned = pointsEarned,
                IsCorrect = isCorrect,
            };
            _db.QuizAnswers.Add(existing);
        }

        await _db.SaveChangesAsync(ct);
        return ToDto(existing, request.SelectedOptions);
    }

    public async Task<QuizAttemptDto?> SubmitAttemptAsync(string attemptId, int? timeTaken, CancellationToken ct = default)
    {
        var attempt = await _db.QuizAttempts.FirstOrDefaultAsync(a => a.Id == attemptId, ct);
        if (attempt is null) return null;

        var totalScore = await _db.QuizAnswers.Where(a => a.AttemptId == attemptId).SumAsync(a => a.PointsEarned, ct);
        var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.Id == attempt.QuizId, ct)
            ?? throw new KeyNotFoundException("Quiz not found");

        var percentage = quiz.TotalPoints > 0 ? totalScore / quiz.TotalPoints * 100 : 0;
        var passed = quiz.PassingScore is { } passingScore ? percentage >= passingScore : (bool?)null;

        attempt.SubmittedAt = DateTime.UtcNow;
        attempt.TimeTaken = timeTaken;
        attempt.Score = totalScore;
        attempt.Percentage = percentage;
        attempt.Passed = passed;
        attempt.Status = QuizAttemptStatus.Submitted;

        await _db.SaveChangesAsync(ct);
        return ToDto(attempt);
    }

    public async Task<QuizAttemptResultsDto?> GetAttemptResultsAsync(string attemptId, CancellationToken ct = default)
    {
        var attempt = await _db.QuizAttempts.FirstOrDefaultAsync(a => a.Id == attemptId, ct);
        if (attempt is null) return null;

        var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.Id == attempt.QuizId, ct)
            ?? throw new KeyNotFoundException("Quiz not found");

        var questions = await _db.QuizQuestions.Include(q => q.Options)
            .Where(q => q.QuizId == attempt.QuizId).OrderBy(q => q.OrderIndex).ThenBy(q => q.CreatedAt).ToListAsync(ct);
        var answers = await _db.QuizAnswers.Where(a => a.AttemptId == attemptId).ToListAsync(ct);

        var questionDtos = questions.Select(q =>
        {
            var answer = answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var answerDto = answer is null ? null : ToDto(answer, DeserializeOptions(answer.SelectedOptions));
            return new QuizQuestionWithAnswerDto(q.Id, q.QuizId, q.QuestionText, q.QuestionType.ToSnakeCase(), q.Points, q.OrderIndex,
                q.Options.OrderBy(o => o.OrderIndex).Select(ToDto).ToList(), answerDto);
        }).ToList();

        return new QuizAttemptResultsDto(ToDto(attempt), ToDto(quiz), questionDtos);
    }

    private async Task<IReadOnlyList<QuizQuestionDto>> GetQuestionsByQuizAsync(string quizId, CancellationToken ct)
    {
        var questions = await _db.QuizQuestions.Include(q => q.Options)
            .Where(q => q.QuizId == quizId).OrderBy(q => q.OrderIndex).ThenBy(q => q.CreatedAt).ToListAsync(ct);

        return questions.Select(q => new QuizQuestionDto(q.Id, q.QuizId, q.QuestionText, q.QuestionType.ToSnakeCase(), q.Points, q.OrderIndex,
            q.Options.OrderBy(o => o.OrderIndex).Select(ToDto).ToList())).ToList();
    }

    private static List<string>? DeserializeOptions(string? json)
        => string.IsNullOrWhiteSpace(json) ? null : JsonSerializer.Deserialize<List<string>>(json);

    private static QuizQuestionOptionDto ToDto(QuizQuestionOption o) => new(o.Id, o.QuestionId, o.OptionText, o.IsCorrect, o.OrderIndex);

    private static QuizAttemptDto ToDto(QuizAttempt a) => new(
        a.Id, a.QuizId, a.StudentId, a.AttemptNumber, a.StartedAt, a.SubmittedAt, a.TimeTaken, a.Score, a.Percentage, a.Passed, a.Status.ToSnakeCase());

    private static QuizAnswerDto ToDto(QuizAnswer a, List<string>? selectedOptions) => new(
        a.Id, a.AttemptId, a.QuestionId, a.AnswerText, selectedOptions, a.PointsEarned, a.IsCorrect);

    private static QuizDto ToDto(Quiz q, IReadOnlyList<QuizQuestionDto>? questions = null) => new(
        q.Id, q.CourseId, q.Title, q.Description, q.QuizType.ToSnakeCase(), q.TimeLimit, q.TotalPoints, q.PassingScore,
        q.AllowRetake, q.MaxAttempts, q.ShuffleQuestions, q.ShowResults, q.StartDate, q.EndDate, q.CreatedBy,
        q.CreatedAt, q.UpdatedAt, questions);
}
