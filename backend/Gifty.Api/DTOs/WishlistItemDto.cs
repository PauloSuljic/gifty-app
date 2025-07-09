namespace gifty_web_backend.DTOs;

public class WishlistItemDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Link { get; set; }
    public bool IsReserved { get; set; }
    public string? ReservedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid WishlistId { get; set; }
}