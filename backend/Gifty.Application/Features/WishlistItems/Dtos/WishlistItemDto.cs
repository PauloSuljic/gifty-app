namespace Gifty.Application.Features.Wishlists.Dtos;

public record WishlistItemDto
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Link { get; set; }
    public bool IsReserved { get; set; }
    public string? ReservedBy { get; set; }
    public bool IsOwner { get; init; }
    public DateTime CreatedAt { get; set; }
    public Guid WishlistId { get; set; }
}