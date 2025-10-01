namespace Gifty.Application.Features.Users.Dtos;

public record CreateUserDto
{
    public required string Id { get; init; }
    public required string Username { get; init; }
    public required string Email { get; init; }
    public string? Bio { get; init; }
    public string? AvatarUrl { get; init; }
    public DateTime DateOfBirth { get; init; }
    
}