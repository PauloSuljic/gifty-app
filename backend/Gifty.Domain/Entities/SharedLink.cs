using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Gifty.Domain.Entities.SharedLinks;

namespace Gifty.Domain.Entities
{
    public class SharedLink : BaseEntity
    {
        [Key]
        public Guid Id { get; init; } = Guid.NewGuid();

        [Required]
        public string ShareCode { get; init; } = Guid.NewGuid().ToString(); 

        [ForeignKey("Wishlist")]
        public Guid WishlistId { get; init; }

        public Wishlist? Wishlist { get; init; }

        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
        private SharedLink() { } // EF Core

        public SharedLink(Guid wishlistId)
        {
            WishlistId = wishlistId;
            RaiseDomainEvent(new SharedLinkCreatedEvent(this));
        }
    }
}
