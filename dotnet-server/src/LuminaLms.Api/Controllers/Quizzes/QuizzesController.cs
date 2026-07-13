using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("quizzes")]
[Authorize]
public class QuizzesController : ControllerBase
{
    private readonly IQuizService _quizzes;

    public QuizzesController(IQuizService quizzes)
    {
        _quizzes = quizzes;
    }

    [HttpPost]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<QuizDto>> Create([FromBody] CreateQuizRequest request, CancellationToken ct)
        => StatusCode(201, await _quizzes.CreateQuizAsync(request, ct));

    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<IReadOnlyList<QuizDto>>> GetByCourse(string courseId, CancellationToken ct)
        => Ok(await _quizzes.GetQuizzesByCourseAsync(courseId, ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDto>> GetById(string id, CancellationToken ct)
    {
        var quiz = await _quizzes.GetQuizByIdAsync(id, includeQuestions: true, ct);
        return quiz is null ? NotFound(new { message = "Quiz not found" }) : Ok(quiz);
    }

    [HttpPost("{quizId}/questions")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<QuizQuestionDto>> AddQuestion(string quizId, [FromBody] AddQuestionRequest request, CancellationToken ct)
        => StatusCode(201, await _quizzes.AddQuestionAsync(quizId, request, ct));

    [HttpPost("questions/{questionId}/options")]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<QuizQuestionOptionDto>> AddOption(string questionId, [FromBody] AddQuestionOptionRequest request, CancellationToken ct)
        => StatusCode(201, await _quizzes.AddQuestionOptionAsync(questionId, request, ct));

    [HttpPost("{quizId}/start")]
    [Authorize(Roles = "student")]
    public async Task<IActionResult> StartAttempt(string quizId, [FromBody] StartAttemptRequest request, CancellationToken ct)
    {
        try
        {
            var attempt = await _quizzes.StartAttemptAsync(quizId, request.StudentId, ct);
            return StatusCode(201, attempt);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("attempts/{attemptId}/answers")]
    [Authorize(Roles = "student")]
    public async Task<ActionResult<QuizAnswerDto>> SubmitAnswer(string attemptId, [FromBody] SubmitAnswerWithQuestionRequest request, CancellationToken ct)
        => StatusCode(201, await _quizzes.SubmitAnswerAsync(attemptId, request.QuestionId, request, ct));

    [HttpPost("attempts/{attemptId}/submit")]
    [Authorize(Roles = "student")]
    public async Task<ActionResult<QuizAttemptDto>> SubmitAttempt(string attemptId, [FromBody] SubmitAttemptRequest request, CancellationToken ct)
    {
        var attempt = await _quizzes.SubmitAttemptAsync(attemptId, request.TimeTaken, ct);
        return attempt is null ? NotFound(new { message = "Attempt not found" }) : Ok(attempt);
    }

    [HttpGet("attempts/{attemptId}/results")]
    public async Task<ActionResult<QuizAttemptResultsDto>> GetResults(string attemptId, CancellationToken ct)
    {
        var results = await _quizzes.GetAttemptResultsAsync(attemptId, ct);
        return results is null ? NotFound(new { message = "Attempt not found" }) : Ok(results);
    }
}

public class StartAttemptRequest
{
    public string StudentId { get; set; } = default!;
}

public class SubmitAnswerWithQuestionRequest : SubmitAnswerRequest
{
    public string QuestionId { get; set; } = default!;
}

public class SubmitAttemptRequest
{
    public int? TimeTaken { get; set; }
}
