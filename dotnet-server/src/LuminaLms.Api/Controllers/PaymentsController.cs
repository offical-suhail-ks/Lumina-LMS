using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;

    public PaymentsController(IPaymentService payments)
    {
        _payments = payments;
    }

    [HttpGet("students/{studentId}/payments")]
    public async Task<ActionResult<PaymentSummaryDto>> GetSummary(string studentId, CancellationToken ct)
        => Ok(await _payments.GetPaymentSummaryAsync(studentId, ct));

    [HttpPost("payments")]
    [Authorize(Roles = "admin,accounting,student")]
    public async Task<IActionResult> Create([FromBody] CreatePaymentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.StudentId) || request.Amount <= 0)
        {
            return BadRequest(new { message = "Student ID and amount are required" });
        }

        var result = await _payments.ProcessPaymentAsync(request, ct);
        return result.Success
            ? StatusCode(201, new { success = true, payment = result.Payment, message = result.Message })
            : BadRequest(new { success = false, message = result.Message });
    }

    [HttpPost("payments/send-reminders")]
    [Authorize(Roles = "admin,accounting")]
    public async Task<IActionResult> SendReminders([FromBody] SendRemindersRequest? request, CancellationToken ct)
    {
        var (sent, errors, total) = await _payments.SendRemindersAsync(request?.DaysBefore ?? 7, ct);
        return Ok(new { success = true, message = $"Reminders sent: {sent}, Errors: {errors}", sent, errors, total });
    }

    [HttpPost("students/{studentId}/send-payment-reminder")]
    [Authorize(Roles = "admin,accounting")]
    public async Task<IActionResult> SendReminder(string studentId, CancellationToken ct)
    {
        var sent = await _payments.SendReminderToStudentAsync(studentId, ct);
        return sent
            ? Ok(new { success = true, message = "Payment reminder sent successfully" })
            : BadRequest(new { message = "Student not found, has no fee due date, or has no remaining balance" });
    }
}

public class SendRemindersRequest
{
    public int DaysBefore { get; set; } = 7;
}
