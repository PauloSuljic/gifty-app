using Gifty.Application.Features.WishlistItems.Dtos;

namespace Gifty.Application.Features.Wishlists.Dtos;

public record WishlistDto
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public bool IsPublic { get; init; }
    public required string UserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public int Order { get; init; }
    public bool IsOwner { get; init; }
    public List<WishlistItemDto> Items { get; init; } = new();
}