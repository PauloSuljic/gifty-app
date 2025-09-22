using System.ComponentModel.DataAnnotations;

namespace Gifty.Application.Features.Wishlists.Dtos;

public class CreateWishlistItemDto
{
    [Required]
    public required string Name { get; set; }
    public string? Link { get; set; }
}