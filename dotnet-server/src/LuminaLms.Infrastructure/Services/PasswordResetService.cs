using LuminaLms.Application.Auth;
using LuminaLms.Application.Common;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Options;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LuminaLms.Infrastructure.Services;

public class PasswordResetService : IPasswordResetService
{
    private const string GenericMessage = "If the email exists, a password reset link has been sent.";

    private readonly LmsDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailSender _emailSender;
    private readonly SmtpOptions _smtpOptions;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(LmsDbContext db, IPasswordHasher passwordHasher, IEmailSender emailSender, IOptions<SmtpOptions> smtpOptions, ILogger<PasswordResetService> logger)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _smtpOptions = smtpOptions.Value;
        _logger = logger;
    }

    public async Task<RequestPasswordResetResult> RequestPasswordResetAsync(string email, CancellationToken ct = default)
    {
        string userId, name, resolvedEmail;
        OwnerType userType;

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
        if (user is not null)
        {
            (userId, name, resolvedEmail, userType) = (user.Id, user.Name, user.Email, OwnerType.User);
        }
        else
        {
            var student = await _db.Students.FirstOrDefaultAsync(s => s.Email == email, ct);
            if (student is null)
            {
                // Anti-enumeration: always report success, matching source behavior.
                return new RequestPasswordResetResult(true, GenericMessage);
            }
            (userId, name, resolvedEmail, userType) = (student.Id, $"{student.FirstName} {student.LastName}", student.Email, OwnerType.Student);
        }

        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddHours(1);

        var existingToken = await _db.PasswordResetTokens.FirstOrDefaultAsync(t => t.UserId == userId && t.UserType == userType, ct);
        if (existingToken is not null)
        {
            existingToken.Token = token;
            existingToken.ExpiresAt = expiresAt;
            existingToken.Used = false;
        }
        else
        {
            _db.PasswordResetTokens.Add(new PasswordResetToken
            {
                Id = $"reset-{Guid.NewGuid()}",
                UserId = userId,
                UserType = userType,
                Token = token,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow,
            });
        }
        await _db.SaveChangesAsync(ct);

        try
        {
            var content = EmailTemplates.PasswordReset(name, _smtpOptions.FrontendUrl, token);
            await _emailSender.SendAsync(resolvedEmail, content.Subject, content.Html, content.Text, ct);
        }
        catch (Exception ex)
        {
            // Best-effort, matching source: a failed send must not fail the request.
            _logger.LogError(ex, "Failed to send password reset email to {Email}", resolvedEmail);
        }

        return new RequestPasswordResetResult(true, GenericMessage);
    }

    public async Task<VerifyResetTokenResult> VerifyResetTokenAsync(string token, CancellationToken ct = default)
    {
        var resetToken = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Token == token && t.ExpiresAt > DateTime.UtcNow && !t.Used, ct);

        return resetToken is null
            ? new VerifyResetTokenResult(false, "Invalid or expired reset token", null, null)
            : new VerifyResetTokenResult(true, null, resetToken.UserId, resetToken.UserType.ToSnakeCase());
    }

    public async Task<ResetPasswordResult> ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
    {
        var verification = await VerifyResetTokenAsync(token, ct);
        if (!verification.Valid)
        {
            return new ResetPasswordResult(false, verification.Message!);
        }

        var hashed = _passwordHasher.Hash(newPassword);
        if (verification.UserType == "user")
        {
            await _db.Users.Where(u => u.Id == verification.UserId).ExecuteUpdateAsync(s => s.SetProperty(u => u.Password, hashed), ct);
        }
        else
        {
            await _db.Students.Where(s => s.Id == verification.UserId).ExecuteUpdateAsync(s => s.SetProperty(st => st.Password, hashed), ct);
        }

        await _db.PasswordResetTokens.Where(t => t.Token == token).ExecuteUpdateAsync(s => s.SetProperty(t => t.Used, true), ct);

        return new ResetPasswordResult(true, "Password reset successfully");
    }
}
