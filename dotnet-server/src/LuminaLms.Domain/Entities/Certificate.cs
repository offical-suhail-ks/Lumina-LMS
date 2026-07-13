using LuminaLms.Domain.Enums;

namespace LuminaLms.Domain.Entities;

public class Certificate
{
    public string Id { get; set; } = default!;
    public string StudentId { get; set; } = default!;
    public string? CourseId { get; set; }
    public CertificateType CertificateType { get; set; } = CertificateType.CourseCompletion;
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateOnly IssuedDate { get; set; }
    public string CertificateNumber { get; set; } = default!;
    public string VerificationCode { get; set; } = default!;
    public string IssuedBy { get; set; } = default!;
    public string? PdfPath { get; set; }
    public DateTime CreatedAt { get; set; }
}
