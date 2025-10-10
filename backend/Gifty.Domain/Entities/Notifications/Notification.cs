using System.ComponentModel.DataAnnotations;

namespace Gifty.Domain.Entities.Notifications
{
    public class Notification : BaseEntity
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();
        [Required]
        public required string UserId { get; init; }
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