using System.ComponentModel.DataAnnotations;

namespace Gifty.Application.Features.Wishlists.Dtos
{
    public class UpdateWishlistItemDto
    {
        [Required]
        public required string Name { get; init; }
        public string? Link { get; init; }
        public bool IsReserved { get; init; } 
        public string? ReservedBy { get; init; }
    }
}