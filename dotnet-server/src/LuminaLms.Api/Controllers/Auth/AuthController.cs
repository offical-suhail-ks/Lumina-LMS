using LuminaLms.Application.Auth;
using Microsoft.AspNetCore.Mvc;

namespace LuminaLms.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IPasswordResetService _passwordResetService;

    public AuthController(IAuthService authService, IPasswordResetService passwordResetService)
    {
        _authService = authService;
        _passwordResetService = passwordResetService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var identifier = request.ResolveIdentifier();
        if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username/email and password are required" });
        }

        var result = await _authService.LoginAsync(identifier, request.Password, ct);
        if (result is null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        return Ok(new LoginResponse(
            result.Token,
            new UserSummaryDto(result.Id, result.Name, result.Role, result.Email)));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }
        var result = await _passwordResetService.RequestPasswordResetAsync(request.Email, ct);
        return Ok(new { success = result.Success, message = result.Message });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Token and new password are required" });
        }
        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long" });
        }

        var result = await _passwordResetService.ResetPasswordAsync(request.Token, request.NewPassword, ct);
        var payload = new { success = result.Success, message = result.Message };
        return result.Success ? Ok(payload) : BadRequest(payload);
    }

    [HttpGet("verify-reset-token")]
    public async Task<IActionResult> VerifyResetToken([FromQuery] string? token, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { message = "Token is required" });
        }

        var result = await _passwordResetService.VerifyResetTokenAsync(token, ct);
        var payload = new { valid = result.Valid, message = result.Message, userId = result.UserId, userType = result.UserType };
        return result.Valid ? Ok(payload) : BadRequest(payload);
    }
}

public class ForgotPasswordRequest
{
    public string? Email { get; set; }
}

public class ResetPasswordRequest
{
    public string? Token { get; set; }
    public string? NewPassword { get; set; }
}
