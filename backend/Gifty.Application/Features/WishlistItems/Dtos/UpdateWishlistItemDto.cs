using System.ComponentModel.DataAnnotations;

namespace Gifty.Application.Features.WishlistItems.Dtos
{
    public class UpdateWishlistItemDto
    {
        [Required]
        public required string Name { get; init; }
        public string? Link { get; init; }
        public bool IsReserved { get; init; } 
        public string? ReservedBy { get; init; }
        public string? Description { get; init; }
    }
}