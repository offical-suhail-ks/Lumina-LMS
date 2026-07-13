using System.Text.Json;

namespace LuminaLms.Application.Common;

/// <summary>
/// Helper for "PATCH: omitted field != null" semantics over a raw JSON body —
/// several source services (studentService.update, courseService.update,
/// assignmentService.update, accountingService.updateTask/updateSalary) build a
/// dynamic UPDATE that only touches columns present in the request payload.
/// System.Text.Json can't express "field omitted" via a plain DTO, so callers
/// bind the raw body as a JsonElement and use these helpers instead.
/// </summary>
public static class JsonPatch
{
    public static bool Has(this JsonElement body, string camelCaseName) =>
        body.ValueKind == JsonValueKind.Object && body.TryGetProperty(camelCaseName, out _);

    public static string? GetString(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind != JsonValueKind.Null ? el.GetString() : null;

    public static bool? GetBool(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind != JsonValueKind.Null ? el.GetBoolean() : null;

    public static decimal? GetDecimal(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind != JsonValueKind.Null ? el.GetDecimal() : null;

    public static int? GetInt(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind != JsonValueKind.Null ? el.GetInt32() : null;

    public static DateOnly? GetDateOnly(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind != JsonValueKind.Null ? DateOnly.Parse(el.GetString()!) : null;

    public static DateTime? GetDateTime(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind != JsonValueKind.Null ? DateTime.Parse(el.GetString()!) : null;

    public static JsonElement? GetObject(this JsonElement body, string name) =>
        body.TryGetProperty(name, out var el) && el.ValueKind == JsonValueKind.Object ? el : null;
}
