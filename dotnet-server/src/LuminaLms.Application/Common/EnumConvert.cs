using System.Globalization;

namespace LuminaLms.Application.Common;

/// <summary>
/// Converts between the snake_case string values the frontend/API contract uses
/// (matching the original Postgres enum labels, e.g. "fee_setup", "in_progress")
/// and the PascalCase C# enum members mapped to those same Postgres enums.
/// </summary>
public static class EnumConvert
{
    public static TEnum ToEnum<TEnum>(this string value) where TEnum : struct, Enum
    {
        var pascal = SnakeToPascal(value);
        return Enum.Parse<TEnum>(pascal, ignoreCase: true);
    }

    public static bool TryToEnum<TEnum>(this string? value, out TEnum result) where TEnum : struct, Enum
    {
        result = default;
        if (string.IsNullOrWhiteSpace(value)) return false;
        return Enum.TryParse(SnakeToPascal(value), ignoreCase: true, out result);
    }

    public static string ToSnakeCase<TEnum>(this TEnum value) where TEnum : struct, Enum
    {
        var name = value.ToString();
        return string.Concat(name.Select((ch, i) => i > 0 && char.IsUpper(ch) ? "_" + ch : ch.ToString())).ToLowerInvariant();
    }

    private static string SnakeToPascal(string value)
    {
        var parts = value.Split('_', StringSplitOptions.RemoveEmptyEntries);
        return string.Concat(parts.Select(p => CultureInfo.InvariantCulture.TextInfo.ToTitleCase(p.ToLowerInvariant())));
    }
}
