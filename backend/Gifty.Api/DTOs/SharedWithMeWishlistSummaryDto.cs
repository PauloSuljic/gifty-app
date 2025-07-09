namespace gifty_web_backend.DTOs;

public class SharedWithMeWishlistOwnerGroupDto
{
    public string OwnerId { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public string? OwnerAvatar { get; set; }
    public List<SharedWithMeWishlistDto> Wishlists { get; set; } = new List<SharedWithMeWishlistDto>();
}

// Represents a single wishlist within the 'SharedWithMeWishlistOwnerGroupDto'
public class SharedWithMeWishlistDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<WishlistItemDto> Items { get; set; } = new List<WishlistItemDto>();
}