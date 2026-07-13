namespace LuminaLms.Infrastructure.Options;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public bool Secure { get; set; }
    public string? User { get; set; }
    public string? Pass { get; set; }
    public string From { get; set; } = "Lumina LMS <no-reply@lumina.local>";
    public string FrontendUrl { get; set; } = "http://localhost:5173";
}
