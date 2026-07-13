namespace LuminaLms.Application.Common;

public record StoredFile(string FileName, string RelativePath, long Size, string ContentType);

public interface IFileStorageService
{
    /// <summary>Module materials and assignment submissions — stored under uploads/modules, any file type (matches source app's unfiltered `upload` multer instance).</summary>
    Task<StoredFile> SaveModuleFileAsync(Stream content, string originalFileName, string contentType, CancellationToken ct = default);

    /// <summary>Course videos — stored under uploads/videos, restricted to mp4/webm/ogg/quicktime, 500MB cap.</summary>
    Task<StoredFile> SaveVideoAsync(Stream content, string originalFileName, string contentType, CancellationToken ct = default);
}
