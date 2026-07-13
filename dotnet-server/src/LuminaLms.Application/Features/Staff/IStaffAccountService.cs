using LuminaLms.Domain.Enums;

namespace LuminaLms.Application.Features.Staff;

/// <summary>
/// CRUD over `users WHERE role = :role`, shared by Faculty and Accounting staff —
/// there is no separate faculty/accounting_users table in the schema.
/// </summary>
public interface IStaffAccountService
{
    Task<IReadOnlyList<StaffUserDto>> GetAllAsync(UserRole role, CancellationToken ct = default);
    Task<StaffUserDto?> GetByIdAsync(string id, UserRole role, CancellationToken ct = default);
    Task<StaffUserDto> CreateAsync(UserRole role, CreateStaffUserRequest request, CancellationToken ct = default);
    Task<StaffUserDto?> UpdateAsync(string id, UserRole role, UpdateStaffUserRequest request, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id, UserRole role, CancellationToken ct = default);
}
