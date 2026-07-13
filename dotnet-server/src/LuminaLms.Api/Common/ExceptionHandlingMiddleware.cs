using System.Net;
using System.Text.Json;

namespace LuminaLms.Api.Common;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error");

            if (context.Response.HasStarted)
            {
                throw;
            }

            // Note: InvalidOperationException is deliberately NOT mapped to 400 here —
            // it's used both for expected business-rule violations (handled with
            // explicit try/catch at the controller, e.g. StudentsController.Create,
            // QuizzesController.StartAttempt) and for genuine infrastructure failures
            // (EF Core wraps transient DB connection errors in InvalidOperationException),
            // which must surface as 500, not look like a client error.
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = ex switch
            {
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                _ => (int)HttpStatusCode.InternalServerError,
            };

            var payload = new
            {
                message = context.Response.StatusCode == (int)HttpStatusCode.InternalServerError
                    ? "Internal server error"
                    : ex.Message,
                error = _env.IsDevelopment() ? ex.Message : null,
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
