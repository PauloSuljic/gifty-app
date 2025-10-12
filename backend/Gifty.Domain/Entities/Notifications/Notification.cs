using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Gifty.Domain.Entities.Users;

namespace Gifty.Domain.Entities.Notifications
{
    public class Notification : BaseEntity
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();
        [Required]
        [ForeignKey("User")]
        public required string UserId { get; init; }

        [JsonIgnore]
        public User? User { get; init; }
        [Required]
        public required string Type { get; set; } // "Birthday", "GiftReserved", "WishlistShared"
        [Required]
        public required string Title { get; set; }
        [Required]
        public required string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    }
}