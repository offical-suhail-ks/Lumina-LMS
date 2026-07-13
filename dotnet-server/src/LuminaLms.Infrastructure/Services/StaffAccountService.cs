using LuminaLms.Application.Auth;
using LuminaLms.Application.Dtos;
using LuminaLms.Application.Services;
using LuminaLms.Domain.Entities;
using LuminaLms.Domain.Enums;
using LuminaLms.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LuminaLms.Infrastructure.Services;

public class StaffAccountService : IStaffAccountService
{
    private readonly LmsDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public StaffAccountService(LmsDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public async Task<IReadOnlyList<StaffUserDto>> GetAllAsync(UserRole role, CancellationToken ct = default)
    {
        var users = await _db.Users.Where(u => u.Role == role).OrderByDescending(u => u.CreatedAt).ToListAsync(ct);
        return users.Select(ToDto).ToList();
    }

    public async Task<StaffUserDto?> GetByIdAsync(string id, UserRole role, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == role, ct);
        return user is null ? null : ToDto(user);
    }

    public async Task<StaffUserDto> CreateAsync(UserRole role, CreateStaffUserRequest request, CancellationToken ct = default)
    {
        var prefix = role.ToString().ToLowerInvariant();
        var user = new User
        {
            Id = $"{prefix}-{Guid.NewGuid()}",
            Username = request.Username,
            Password = _passwordHasher.Hash(request.Password),
            Role = role,
            Name = request.Name,
            Email = request.Email,
            Department = request.Department,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        return ToDto(user);
    }

    public async Task<StaffUserDto?> UpdateAsync(string id, UserRole role, UpdateStaffUserRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id && u.Role == role, ct);
        if (user is null) return null;

        if (request.Username is not null) user.Username = request.Username;
        if (request.Name is not null) user.Name = request.Name;
        if (request.Email is not null) user.Email = request.Email;
        if (request.Department is not null) user.Department = request.Department;
        if (!string.IsNullOrEmpty(request.Password)) user.Password = _passwordHasher.Hash(request.Password);
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToDto(user);
    }

    public async Task<bool> DeleteAsync(string id, UserRole role, CancellationToken ct = default)
    {
        var rows = await _db.Users.Where(u => u.Id == id && u.Role == role).ExecuteDeleteAsync(ct);
        return rows > 0;
    }

    private static StaffUserDto ToDto(User u) => new(u.Id, u.Username, u.Name, u.Email, u.Role.ToString().ToLowerInvariant(), u.Department, u.CreatedAt, u.UpdatedAt);
}
