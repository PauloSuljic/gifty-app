using System.ComponentModel.DataAnnotations;

namespace Gifty.Application.Features.Wishlists.Dtos
{
    public class CreateWishlistDto
    {
        [Required]
        public required string Name { get; set; }
        public bool IsPublic { get; set; }
        public int? Order { get; set; }
    }
}