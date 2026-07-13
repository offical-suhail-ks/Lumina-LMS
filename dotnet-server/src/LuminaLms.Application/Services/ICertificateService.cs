using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface ICertificateService
{
    Task<CertificateDto> CreateAsync(CreateCertificateRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<CertificateDto>> GetByStudentAsync(string studentId, CancellationToken ct = default);
    Task<CertificateDto?> VerifyAsync(string verificationCode, CancellationToken ct = default);
}
