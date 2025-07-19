namespace Gifty.Application.Features.Wishlists.Dtos;

public record ReorderWishlistDto
{ 
        public Guid Id { get; init; }
        public int Order { get; init; }
}