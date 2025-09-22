namespace Gifty.Application.Features.Wishlists.Dtos;

public record PatchWishlistItemDto
{
    public string? Name { get; init; }
    public string? Link { get; init; }
}