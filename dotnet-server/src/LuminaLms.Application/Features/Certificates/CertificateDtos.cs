namespace LuminaLms.Application.Features.Certificates;

public record CertificateDto(
    string Id, string StudentId, string? CourseId, string CertificateType, string Title, string? Description,
    DateOnly IssuedDate, string CertificateNumber, string VerificationCode, string IssuedBy, string? PdfPath, DateTime CreatedAt,
    string? StudentFirstName = null, string? StudentLastName = null, string? StudentEmail = null);

public class CreateCertificateRequest
{
    public string StudentId { get; set; } = default!;
    public string? CourseId { get; set; }
    public string CertificateType { get; set; } = "course_completion";
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public string IssuedBy { get; set; } = default!;
}
