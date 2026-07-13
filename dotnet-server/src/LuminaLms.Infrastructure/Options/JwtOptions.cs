namespace LuminaLms.Infrastructure.Options;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = default!;
    public string Issuer { get; set; } = "LuminaLms";
    public string Audience { get; set; } = "LuminaLms";
    public int ExpiryMinutes { get; set; } = 480;
}
