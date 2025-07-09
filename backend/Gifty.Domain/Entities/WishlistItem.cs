using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Gifty.Domain.Entities
{
    public class WishlistItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public required string Name { get; set; }
        public string? Link { get; set; }
        public bool IsReserved { get; set; } = false;
        public string? ReservedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [ForeignKey("Wishlist")]
        public Guid WishlistId { get; set; }
        [JsonIgnore]
        public Wishlist? Wishlist { get; set; }
    }
}
