using Gifty.Application.Features.Wishlists.Dtos;

namespace Gifty.Application.Features.SharedLinks.Dtos;

public class SharedWishlistResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string? OwnerName { get; set; } 
    public string? OwnerAvatar { get; set; }
    public List<WishlistItemDto> Items { get; set; } = new();
}