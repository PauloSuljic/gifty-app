namespace Gifty.Application.Features.WishlistItems.Dtos;

public record PatchWishlistItemDto
{
    public string? Name { get; init; }
    public string? Link { get; init; }
}