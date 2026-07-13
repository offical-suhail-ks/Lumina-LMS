using LuminaLms.Application.Common;
using LuminaLms.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace LuminaLms.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private static readonly HashSet<string> VideoMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "video/mp4", "video/webm", "video/ogg", "video/quicktime",
    };

    private readonly string _root;

    public LocalFileStorageService(IOptions<StorageOptions> options)
    {
        _root = Path.IsPathRooted(options.Value.RootPath)
            ? options.Value.RootPath
            : Path.Combine(AppContext.BaseDirectory, options.Value.RootPath);
    }

    public Task<StoredFile> SaveModuleFileAsync(Stream content, string originalFileName, string contentType, CancellationToken ct = default)
        => SaveAsync(content, originalFileName, contentType, "modules", ct);

    public async Task<StoredFile> SaveVideoAsync(Stream content, string originalFileName, string contentType, CancellationToken ct = default)
    {
        if (!VideoMimeTypes.Contains(contentType))
        {
            throw new InvalidOperationException("Invalid file type. Only MP4, WebM, OGG, and QuickTime videos are allowed.");
        }

        const long maxBytes = 500L * 1024 * 1024;
        if (content.CanSeek && content.Length > maxBytes)
        {
            throw new InvalidOperationException("Video exceeds the 500MB upload limit.");
        }

        return await SaveAsync(content, originalFileName, contentType, "videos", ct);
    }

    private async Task<StoredFile> SaveAsync(Stream content, string originalFileName, string contentType, string category, CancellationToken ct)
    {
        var dir = Path.Combine(_root, category);
        Directory.CreateDirectory(dir);

        // Sanitize: keep only the base file name (no path separators), matching the
        // uuid-prefix scheme used by the source app but closing its path-traversal gap.
        var safeName = Path.GetFileName(originalFileName);
        var storedName = $"{Guid.NewGuid():N}-{safeName}";
        var fullPath = Path.Combine(dir, storedName);

        await using (var fileStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write))
        {
            await content.CopyToAsync(fileStream, ct);
        }

        var size = new FileInfo(fullPath).Length;
        var relativePath = $"{category}/{storedName}";
        return new StoredFile(storedName, relativePath, size, contentType);
    }
}
