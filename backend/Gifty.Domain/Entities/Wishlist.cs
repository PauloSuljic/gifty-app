using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Gifty.Domain.Entities.Users;

namespace Gifty.Domain.Entities
{
    public class Wishlist
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();
        [Required]
        public required string Name { get; set; }
        public bool IsPublic { get; set; }
        [Required]
        [ForeignKey("User")]
        public required string UserId { get; init; }
        [JsonIgnore]
        public User? User { get; init; }
        public ICollection<WishlistItem> Items { get; init; } = new List<WishlistItem>();
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
        public int Order { get; set; }
    }
}
