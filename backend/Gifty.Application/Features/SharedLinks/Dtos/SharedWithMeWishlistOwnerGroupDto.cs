using Gifty.Application.Features.WishlistItems.Dtos;

namespace Gifty.Application.Features.SharedLinks.Dtos;

public record SharedWithMeWishlistOwnerGroupDto
{
    public string OwnerId { get; init; } = string.Empty;
    public string? OwnerName { get; init; }
    public string? OwnerAvatar { get; init; }
    public List<SharedWithMeWishlistDto> Wishlists { get; init; } = new();
    public DateOnly? OwnerDateOfBirth { get; init; }
}

public record SharedWithMeWishlistDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public List<WishlistItemDto> Items { get; init; } = new();
}