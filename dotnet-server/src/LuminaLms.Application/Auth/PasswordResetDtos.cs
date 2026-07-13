namespace LuminaLms.Application.Auth;

public record RequestPasswordResetResult(bool Success, string Message);
public record VerifyResetTokenResult(bool Valid, string? Message, string? UserId, string? UserType);
public record ResetPasswordResult(bool Success, string Message);
