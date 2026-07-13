namespace LuminaLms.Application.Common;

public record EmailContent(string Subject, string Html, string Text);

/// <summary>
/// HTML/text templates for transactional email. Unlike the source Node app, these
/// never embed a plaintext password (passwords are bcrypt-hashed now and are not
/// recoverable) — welcome/offer-letter emails instead carry a one-time "set your
/// password" link built from the same password-reset-token mechanism.
/// </summary>
public static class EmailTemplates
{
    public static EmailContent StudentWelcome(string studentName, string username, string frontendUrl, string setPasswordToken)
    {
        var link = $"{frontendUrl}/reset-password?token={setPasswordToken}";
        var subject = "Welcome to Lumina LMS";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
              <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px;border-radius:8px 8px 0 0;color:#fff">
                <h1 style="margin:0;font-size:22px">Welcome to Lumina LMS</h1>
              </div>
              <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
                <p>Hi {studentName},</p>
                <p>Your account has been created. Your login username is:</p>
                <div style="background:#f5f5f7;border-radius:6px;padding:12px 16px;margin:12px 0">
                  <strong>{username}</strong>
                </div>
                <p>Set your password to activate your account:</p>
                <p><a href="{link}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">Set your password</a></p>
                <p style="color:#888;font-size:13px">This link expires in 1 hour.</p>
              </div>
            </div>
            """;
        var text = $"Welcome to Lumina LMS, {studentName}. Username: {username}. Set your password: {link} (expires in 1 hour)";
        return new EmailContent(subject, html, text);
    }

    public static EmailContent StudentOfferLetter(
        string studentName, string username, string courseName, string? year, string? cohort,
        decimal? courseFee, string? paymentPlan, string frontendUrl, string setPasswordToken)
    {
        var link = $"{frontendUrl}/reset-password?token={setPasswordToken}";
        var subject = "Your Offer Letter — Lumina LMS";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
              <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px;border-radius:8px 8px 0 0;color:#fff">
                <h1 style="margin:0;font-size:22px">Offer Letter</h1>
              </div>
              <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
                <p>Dear {studentName},</p>
                <p>Congratulations! You have been offered a place in <strong>{courseName}</strong>.</p>
                <ul>
                  {(year is null ? "" : $"<li>Year: {year}</li>")}
                  {(cohort is null ? "" : $"<li>Cohort: {cohort}</li>")}
                  {(courseFee is null ? "" : $"<li>Course fee: {courseFee:C}</li>")}
                  {(paymentPlan is null ? "" : $"<li>Payment plan: {paymentPlan}</li>")}
                </ul>
                <p>Your login username is: <strong>{username}</strong></p>
                <p>Set your password to activate your account:</p>
                <p><a href="{link}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">Set your password</a></p>
                <p style="color:#888;font-size:13px">This link expires in 1 hour.</p>
              </div>
            </div>
            """;
        var text = $"Offer letter for {studentName} — course {courseName}. Username: {username}. Set your password: {link}";
        return new EmailContent(subject, html, text);
    }

    public static EmailContent PaymentReminder(string studentName, decimal amountDue, DateOnly dueDate, string frontendUrl)
    {
        var daysUntilDue = dueDate.DayNumber - DateOnly.FromDateTime(DateTime.UtcNow).DayNumber;
        var urgent = daysUntilDue <= 3;
        var color = urgent ? "#dc2626" : "#d97706";
        var link = $"{frontendUrl}/fees";
        var subject = urgent ? "Urgent: Fee Payment Due" : "Fee Payment Reminder";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
              <div style="padding:24px;border:1px solid #eee;border-radius:8px">
                <p>Hi {studentName},</p>
                <p style="color:{color};font-weight:bold">
                  {(daysUntilDue < 0 ? $"Your payment of {amountDue:C} is overdue." : $"Your payment of {amountDue:C} is due in {daysUntilDue} day(s).")}
                </p>
                <p>Due date: {dueDate:yyyy-MM-dd}</p>
                <p><a href="{link}" style="background:{color};color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">View fee details</a></p>
              </div>
            </div>
            """;
        var text = $"Hi {studentName}, payment of {amountDue:C} due {dueDate:yyyy-MM-dd}. Details: {link}";
        return new EmailContent(subject, html, text);
    }

    public static EmailContent PasswordReset(string name, string frontendUrl, string resetToken)
    {
        var link = $"{frontendUrl}/reset-password?token={resetToken}";
        var subject = "Reset your Lumina LMS password";
        var html = $"""
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
              <div style="padding:24px;border:1px solid #eee;border-radius:8px">
                <p>Hi {name},</p>
                <p>We received a request to reset your password. This link expires in 1 hour:</p>
                <p><a href="{link}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">Reset password</a></p>
                <p style="color:#888;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
              </div>
            </div>
            """;
        var text = $"Reset your password: {link} (expires in 1 hour). If you didn't request this, ignore this email.";
        return new EmailContent(subject, html, text);
    }
}
