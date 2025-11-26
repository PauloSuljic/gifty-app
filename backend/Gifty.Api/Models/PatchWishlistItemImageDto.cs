namespace gifty_web_backend.Models;

public record PatchWishlistItemImageDto
{
    public IFormFile? Image { get; set; }
}