using System.Reflection;
using System.Text;

namespace LuminaLms.Api.Common;

/// <summary>Minimal CSV serializer for the /export endpoints — reflects public properties of records/DTOs into columns.</summary>
public static class CsvWriter
{
    public static string Write<T>(IReadOnlyList<T> rows)
    {
        if (rows.Count == 0) return string.Empty;

        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var sb = new StringBuilder();
        sb.AppendLine(string.Join(',', properties.Select(p => p.Name)));

        foreach (var row in rows)
        {
            var values = properties.Select(p => FormatValue(p.GetValue(row)));
            sb.AppendLine(string.Join(',', values));
        }

        return sb.ToString();
    }

    private static string FormatValue(object? value)
    {
        if (value is null) return string.Empty;
        if (value is System.Collections.IEnumerable enumerable and not string)
        {
            value = string.Join(';', enumerable.Cast<object?>());
        }

        var text = value.ToString() ?? string.Empty;
        return text.Contains(',') || text.Contains('"') || text.Contains('\n')
            ? $"\"{text.Replace("\"", "\"\"")}\""
            : text;
    }
}
