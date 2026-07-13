using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("certificates")]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificates;

    public CertificatesController(ICertificateService certificates)
    {
        _certificates = certificates;
    }

    [HttpPost]
    [Authorize(Roles = "admin,faculty")]
    public async Task<ActionResult<CertificateDto>> Create([FromBody] CreateCertificateRequest request, CancellationToken ct)
        => StatusCode(201, await _certificates.CreateAsync(request, ct));

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<CertificateDto>>> GetByStudent(string studentId, CancellationToken ct)
        => Ok(await _certificates.GetByStudentAsync(studentId, ct));

    [HttpGet("verify/{verificationCode}")]
    [AllowAnonymous]
    public async Task<ActionResult<CertificateDto>> Verify(string verificationCode, CancellationToken ct)
    {
        var certificate = await _certificates.VerifyAsync(verificationCode, ct);
        return certificate is null ? NotFound(new { message = "Certificate not found" }) : Ok(certificate);
    }
}
