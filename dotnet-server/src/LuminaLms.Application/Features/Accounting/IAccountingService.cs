using System.Text.Json;

namespace LuminaLms.Application.Features.Accounting;

public interface IAccountingService
{
    Task<IReadOnlyList<AccountingTaskDto>> GetAllTasksAsync(string? status, string? assignedTo, string? taskType, CancellationToken ct = default);
    Task<AccountingTaskDto?> GetTaskByIdAsync(string id, CancellationToken ct = default);
    Task<AccountingTaskDto> CreateTaskAsync(CreateAccountingTaskRequest request, CancellationToken ct = default);
    Task<AccountingTaskDto?> UpdateTaskAsync(string id, JsonElement patch, CancellationToken ct = default);
    Task<AccountingTaskDto?> CompleteTaskAsync(string id, CompleteAccountingTaskRequest request, CancellationToken ct = default);
    Task<AccountingTaskDto?> SendToAdminAsync(string id, SendToAdminRequest request, CancellationToken ct = default);
    Task<AccountingTaskDto?> ReviewTaskAsync(string id, ReviewTaskRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<SalaryDto>> GetAllSalariesAsync(string? employeeId, string? status, string? employeeType, CancellationToken ct = default);
    Task<SalaryDto?> GetSalaryByIdAsync(string id, CancellationToken ct = default);
    Task<SalaryDto> CreateSalaryAsync(CreateSalaryRequest request, CancellationToken ct = default);
    Task<SalaryDto?> UpdateSalaryAsync(string id, JsonElement patch, CancellationToken ct = default);

    Task<IReadOnlyList<SalaryPaymentDto>> GetSalaryPaymentsAsync(string salaryId, CancellationToken ct = default);
    Task<SalaryPaymentDto> CreateSalaryPaymentAsync(string salaryId, CreateSalaryPaymentRequest request, CancellationToken ct = default);
    Task<SalaryPaymentDto?> UpdateSalaryPaymentAsync(string id, JsonElement patch, CancellationToken ct = default);
}
