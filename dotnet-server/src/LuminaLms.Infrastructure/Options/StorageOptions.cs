namespace LuminaLms.Infrastructure.Options;

public class StorageOptions
{
    public const string SectionName = "Storage";

    /// <summary>Root folder for uploaded files, matching the source app's server/uploads layout.</summary>
    public string RootPath { get; set; } = "uploads";
}
