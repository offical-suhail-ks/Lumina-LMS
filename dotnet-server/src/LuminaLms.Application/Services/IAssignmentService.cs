using LuminaLms.Application.Dtos;

namespace LuminaLms.Application.Services;

public interface IAssignmentService
{
    Task<IReadOnlyList<AssignmentDto>> GetAllAsync(CancellationToken ct = default);
    Task<AssignmentDto?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, CancellationToken ct = default);
    Task<AssignmentDto?> UpdateAsync(string id, UpdateAssignmentRequest request, CancellationToken ct = default);
    Task<AssignmentSubmissionDto?> SubmitAsync(string assignmentId, SubmitAssignmentRequest request, string? artifactName, CancellationToken ct = default);
    Task<AssignmentSubmissionDto?> GradeSubmissionAsync(string submissionId, GradeSubmissionRequest request, CancellationToken ct = default);
}
