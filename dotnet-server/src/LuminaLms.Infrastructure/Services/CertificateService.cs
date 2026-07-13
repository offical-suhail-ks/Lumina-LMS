using System.Security.Cryptography;
using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class CertificateService : ICertificateService
{
    private readonly LmsDbContext _db;

    public CertificateService(LmsDbContext db)
    {
        _db = db;
    }

    public async Task<CertificateDto> CreateAsync(CreateCertificateRequest request, CancellationToken ct = default)
    {
        var certificate = new Certificate
        {
            Id = $"cert-{Guid.NewGuid()}",
            StudentId = request.StudentId,
            CourseId = request.CourseId,
            CertificateType = request.CertificateType.ToEnum<Domain.Enums.CertificateType>(),
            Title = request.Title,
            Description = request.Description,
            IssuedDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CertificateNumber = GenerateCertificateNumber(),
            VerificationCode = GenerateVerificationCode(),
            IssuedBy = request.IssuedBy,
            CreatedAt = DateTime.UtcNow,
        };
        _db.Certificates.Add(certificate);
        await _db.SaveChangesAsync(ct);
        return ToDto(certificate);
    }

    public async Task<IReadOnlyList<CertificateDto>> GetByStudentAsync(string studentId, CancellationToken ct = default)
    {
        var certificates = await _db.Certificates.Where(c => c.StudentId == studentId)
            .OrderByDescending(c => c.IssuedDate).ToListAsync(ct);
        return certificates.Select(c => ToDto(c)).ToList();
    }

    public async Task<CertificateDto?> VerifyAsync(string verificationCode, CancellationToken ct = default)
    {
        var certificate = await _db.Certificates.FirstOrDefaultAsync(c => c.VerificationCode == verificationCode, ct);
        if (certificate is null) return null;

        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == certificate.StudentId, ct);
        return ToDto(certificate, student?.FirstName, student?.LastName, student?.Email);
    }

    private static string GenerateCertificateNumber()
    {
        var timestamp = Convert.ToString(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), 36).ToUpperInvariant();
        var random = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"CERT-{timestamp}-{random}";
    }

    private static string GenerateVerificationCode() => Convert.ToHexString(RandomNumberGenerator.GetBytes(16));

    private static CertificateDto ToDto(Certificate c, string? firstName = null, string? lastName = null, string? email = null) => new(
        c.Id, c.StudentId, c.CourseId, c.CertificateType.ToSnakeCase(), c.Title, c.Description, c.IssuedDate,
        c.CertificateNumber, c.VerificationCode, c.IssuedBy, c.PdfPath, c.CreatedAt, firstName, lastName, email);
}
