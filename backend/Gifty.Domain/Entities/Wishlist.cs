using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Gifty.Domain.Entities
{
    public class Wishlist
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public required string Name { get; set; }
        public bool IsPublic { get; set; } = false;
        [Required]
        [ForeignKey("User")]
        public required string UserId { get; set; }
        [JsonIgnore]
        public User? User { get; set; }
        public ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Order { get; set; }
    }
}
