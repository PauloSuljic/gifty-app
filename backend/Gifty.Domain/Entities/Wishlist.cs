using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Gifty.Domain.Entities.Users;
using Gifty.Domain.Entities.Wishlists;

namespace Gifty.Domain.Entities
{
    public class Wishlist : BaseEntity
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
        private Wishlist() { } // EF Core
        
        public static Wishlist Create(string name, string userId, bool isPublic, int order = 0)
        {
            var wishlist = new Wishlist
            {
                Name = name,
                UserId = userId,
                IsPublic = isPublic,
                Order = order,
                CreatedAt = DateTime.UtcNow
            };

            wishlist.RaiseDomainEvent(new WishlistCreatedEvent(wishlist));
            return wishlist;
        }
        
        public void Update(string name, bool isPublic, int order)
        {
            Name = name;
            IsPublic = isPublic;

            RaiseDomainEvent(new WishlistUpdatedEvent(this));
        }
        
        public void MarkAsDeleted()
        {
            RaiseDomainEvent(new WishlistDeletedEvent(this));
        }
        
        public void Reorder(int newOrder)
        {
            Order = newOrder;

            RaiseDomainEvent(new WishlistReorderedEvent(this));
        }
        
        public void Rename(string newName)
        {
            Name = newName;

            RaiseDomainEvent(new WishlistRenamedEvent(this));
        }
    }
}
