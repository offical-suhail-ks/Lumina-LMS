namespace LuminaLms.Infrastructure.Persistence;

/// <summary>
/// Npgsql only accepts the classic ADO.NET `Key=Value;...` connection string
/// format, but most hosted Postgres providers (Neon, Heroku, Railway, Supabase)
/// hand out `postgres://user:pass@host/db?sslmode=require` URIs by default.
/// This normalizes either form so both are accepted without manual reformatting.
/// </summary>
public static class PostgresConnectionStringHelper
{
    public static string Normalize(string connectionString)
    {
        if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return connectionString;
        }

        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');
        var queryParams = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Split('=', 2))
            .ToDictionary(p => Uri.UnescapeDataString(p[0]), p => p.Length > 1 ? Uri.UnescapeDataString(p[1]) : string.Empty, StringComparer.OrdinalIgnoreCase);
        var sslMode = queryParams.GetValueOrDefault("sslmode") switch
        {
            "require" or "verify-ca" or "verify-full" => "Require",
            "disable" => "Disable",
            "prefer" => "Prefer",
            _ => "Require", // hosted providers overwhelmingly require TLS; default to the safe choice
        };

        var builder = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = database,
            Username = username,
            Password = password,
            SslMode = Enum.Parse<Npgsql.SslMode>(sslMode),
        };

        return builder.ConnectionString;
    }
}
