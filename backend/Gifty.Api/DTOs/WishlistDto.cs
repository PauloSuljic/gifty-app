namespace gifty_web_backend.DTOs;

public class WishlistDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsPublic { get; set; }
    public required string UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Order { get; set; }
    public List<WishlistItemDto> Items { get; set; } = new();
}