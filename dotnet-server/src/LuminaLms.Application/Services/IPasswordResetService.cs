using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IPasswordResetService
{
    /// <summary>Always reports success regardless of whether the email exists, to avoid account enumeration.</summary>
    Task<RequestPasswordResetResult> RequestPasswordResetAsync(string email, CancellationToken ct = default);
    Task<VerifyResetTokenResult> VerifyResetTokenAsync(string token, CancellationToken ct = default);
    Task<ResetPasswordResult> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);
}
