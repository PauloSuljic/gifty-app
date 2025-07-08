using System.ComponentModel.DataAnnotations;

namespace gifty_web_backend.DTOs;

public class CreateWishlistItemDto
{
    [Required]
    public required string Name { get; set; }
    public string? Link { get; set; }
    public Guid WishlistId { get; set; }
}