using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

/// <summary>
/// Placeholder for AI integration, ported as-is from the source app's demo stub
/// (no real AI service is wired up — plug in a Claude/OpenAI call here later).
/// </summary>
[ApiController]
[Route("ai")]
[Authorize(Roles = "admin,faculty")]
public class AiController : ControllerBase
{
    [HttpPost("generate-questions")]
    public IActionResult GenerateQuestions([FromBody] GenerateQuestionsRequest request)
    {
        var count = request.Count > 0 ? request.Count : 5;
        var questions = Enumerable.Range(1, count).Select(i => new
        {
            questionText = $"Sample question {i} about {request.Topic}?",
            questionType = "multiple_choice",
            points = 1,
            options = new[]
            {
                new { text = "Option A", isCorrect = i == 1 },
                new { text = "Option B", isCorrect = false },
                new { text = "Option C", isCorrect = false },
                new { text = "Option D", isCorrect = false },
            },
        });

        return Ok(new { questions, message = "AI integration pending - using demo questions" });
    }
}

public class GenerateQuestionsRequest
{
    public string Topic { get; set; } = default!;
    public string? CourseId { get; set; }
    public int Count { get; set; } = 5;
}
