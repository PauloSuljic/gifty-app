namespace gifty_web_backend.Models;

public record PatchWishlistItemDto
{
    public string? Name { get; init; }
    public string? Link { get; init; }
}