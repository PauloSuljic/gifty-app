using System.ComponentModel.DataAnnotations;

namespace gifty_web_backend.DTOs;

public class CreateUserDto
{
    [Required]
    public required string Username { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}