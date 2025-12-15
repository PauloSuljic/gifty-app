namespace Gifty.Application.Features.WishlistItems.Dtos;

public record WishlistItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string? Link { get; set; }
    public bool IsReserved { get; set; }
    public string? ReservedBy { get; set; }
    public bool IsOwner { get; init; }
    public DateTime CreatedAt { get; set; }
    public Guid WishlistId { get; set; }
    public int Order { get; set; }
    public string? ImageUrl { get; set; }
}