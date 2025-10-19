using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Domain.Entities
{
    public class WishlistItem : BaseEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public required string Name { get; set; }
        public string? Link { get; set; }
        public bool IsReserved { get; set; } = false;
        public string? ReservedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Order { get; set; } 
        [ForeignKey("Wishlist")]
        public Guid WishlistId { get; set; }
        [JsonIgnore]
        public Wishlist? Wishlist { get; set; }
        private WishlistItem() { }
        public static WishlistItem Create(Guid wishlistId, string name, string? link, int order)
        {
            var item = new WishlistItem
            {
                WishlistId = wishlistId,
                Name = name,
                Link = link,
                CreatedAt = DateTime.UtcNow,
                IsReserved = false,
                ReservedBy = null,
                Order = order
            };

            item.RaiseDomainEvent(new WishlistItemCreatedEvent(item));
            return item;
        }

        public void Update(string name, string? link)
        {
            Name = name;
            Link = link;

            RaiseDomainEvent(new WishlistItemUpdatedEvent(this));
        }
        
        public void UpdatePartial(string? name, string? link)
        {
            if (name != null) Name = name;
            if (link != null) Link = link;

            RaiseDomainEvent(new WishlistItemPartiallyUpdatedEvent(this));
        }
        
        public void Reorder(int newOrder)
        {
            Order = newOrder;
            //RaiseDomainEvent(new WishlistItemReorderedEvent(this));
        }

        public void Delete()
        {
            RaiseDomainEvent(new WishlistItemDeletedEvent(this));
        }

        public void ToggleReservation(string userId)
        {
            if (IsReserved && ReservedBy == userId)
            {
                IsReserved = false;
                ReservedBy = null;
            }
            else if (!IsReserved)
            {
                IsReserved = true;
                ReservedBy = userId;
            }

            // Specific event (used by notifications)
            RaiseDomainEvent(new WishlistItemReservationToggledEvent(this));

            // Generic event (used by audit/admin/analytics)
            RaiseDomainEvent(new WishlistItemUpdatedEvent(this));
        }
    }
}
