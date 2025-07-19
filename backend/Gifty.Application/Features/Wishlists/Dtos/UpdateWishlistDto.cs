namespace Gifty.Application.Features.Wishlists.Dtos;

public record UpdateWishlistDto
{
    public required string Name { get; init; }
    public bool IsPublic { get; init; }
    public int Order { get; init; }
}