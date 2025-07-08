using System.ComponentModel.DataAnnotations;

namespace gifty_web_backend.DTOs
{
    public class CreateWishlistDto
    {
        [Required]
        public required string Name { get; set; }
        public bool IsPublic { get; set; }
    }
}