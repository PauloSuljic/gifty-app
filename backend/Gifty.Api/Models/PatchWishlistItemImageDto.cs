namespace gifty_web_backend.Models;

public record PatchWishlistItemImageDto
{
    public IFormFile? Image { get; set; }
    public string? Name { get; set; }
    public string? Link { get; set; }
}