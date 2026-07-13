using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Authorize(Roles = "admin,accounting")]
public class AccountingController : ControllerBase
{
    private readonly IAccountingService _accounting;

    public AccountingController(IAccountingService accounting)
    {
        _accounting = accounting;
    }

    [HttpGet("accounting/tasks")]
    public async Task<ActionResult<IReadOnlyList<AccountingTaskDto>>> GetTasks(
        [FromQuery] string? status, [FromQuery] string? assignedTo, [FromQuery] string? taskType, CancellationToken ct)
        => Ok(await _accounting.GetAllTasksAsync(status, assignedTo, taskType, ct));

    [HttpGet("accounting/tasks/{id}")]
    public async Task<ActionResult<AccountingTaskDto>> GetTask(string id, CancellationToken ct)
    {
        var task = await _accounting.GetTaskByIdAsync(id, ct);
        return task is null ? NotFound(new { message = "Task not found" }) : Ok(task);
    }

    [HttpPut("accounting/tasks/{id}")]
    public async Task<ActionResult<AccountingTaskDto>> UpdateTask(string id, [FromBody] JsonElement patch, CancellationToken ct)
    {
        var task = await _accounting.UpdateTaskAsync(id, patch, ct);
        return task is null ? NotFound(new { message = "Task not found" }) : Ok(task);
    }

    [HttpPost("accounting/tasks/{id}/send-to-admin")]
    public async Task<ActionResult<AccountingTaskDto>> SendToAdmin(string id, [FromBody] SendToAdminRequest request, CancellationToken ct)
    {
        var task = await _accounting.SendToAdminAsync(id, request, ct);
        return task is null ? NotFound(new { message = "Task not found" }) : Ok(task);
    }

    [HttpPost("accounting/tasks/{id}/complete")]
    public async Task<ActionResult<AccountingTaskDto>> Complete(string id, [FromBody] CompleteAccountingTaskRequest request, CancellationToken ct)
    {
        var task = await _accounting.CompleteTaskAsync(id, request, ct);
        return task is null ? NotFound(new { message = "Task not found" }) : Ok(task);
    }

    [HttpPost("accounting/tasks/{id}/review")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<AccountingTaskDto>> Review(string id, [FromBody] ReviewTaskRequest request, CancellationToken ct)
    {
        var task = await _accounting.ReviewTaskAsync(id, request, ct);
        return task is null ? NotFound(new { message = "Task not found" }) : Ok(task);
    }

    [HttpGet("accounting/salaries")]
    public async Task<ActionResult<IReadOnlyList<SalaryDto>>> GetSalaries(
        [FromQuery] string? employeeId, [FromQuery] string? status, [FromQuery] string? employeeType, CancellationToken ct)
        => Ok(await _accounting.GetAllSalariesAsync(employeeId, status, employeeType, ct));

    [HttpGet("accounting/salaries/{id}")]
    public async Task<ActionResult<SalaryDto>> GetSalary(string id, CancellationToken ct)
    {
        var salary = await _accounting.GetSalaryByIdAsync(id, ct);
        return salary is null ? NotFound(new { message = "Salary not found" }) : Ok(salary);
    }

    [HttpPost("accounting/salaries")]
    public async Task<ActionResult<SalaryDto>> CreateSalary([FromBody] CreateSalaryRequest request, CancellationToken ct)
        => Ok(await _accounting.CreateSalaryAsync(request, ct));

    [HttpPut("accounting/salaries/{id}")]
    public async Task<ActionResult<SalaryDto>> UpdateSalary(string id, [FromBody] JsonElement patch, CancellationToken ct)
    {
        var salary = await _accounting.UpdateSalaryAsync(id, patch, ct);
        return salary is null ? NotFound(new { message = "Salary not found" }) : Ok(salary);
    }

    [HttpGet("accounting/salaries/{salaryId}/payments")]
    public async Task<ActionResult<IReadOnlyList<SalaryPaymentDto>>> GetSalaryPayments(string salaryId, CancellationToken ct)
        => Ok(await _accounting.GetSalaryPaymentsAsync(salaryId, ct));

    [HttpPost("accounting/salaries/{salaryId}/payments")]
    public async Task<ActionResult<SalaryPaymentDto>> CreateSalaryPayment(string salaryId, [FromBody] CreateSalaryPaymentRequest request, CancellationToken ct)
        => Ok(await _accounting.CreateSalaryPaymentAsync(salaryId, request, ct));

    [HttpPut("accounting/salary-payments/{id}")]
    public async Task<ActionResult<SalaryPaymentDto>> UpdateSalaryPayment(string id, [FromBody] JsonElement patch, CancellationToken ct)
    {
        var payment = await _accounting.UpdateSalaryPaymentAsync(id, patch, ct);
        return payment is null ? NotFound(new { message = "Salary payment not found" }) : Ok(payment);
    }
}
