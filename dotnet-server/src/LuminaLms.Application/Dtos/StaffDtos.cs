namespace LuminaLms.Application.Dtos;

public record StaffUserDto(string Id, string Username, string Name, string Email, string Role, string? Department, DateTime CreatedAt, DateTime UpdatedAt);

public class CreateStaffUserRequest
{
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string? Department { get; set; }
}

public class UpdateStaffUserRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Department { get; set; }
}
