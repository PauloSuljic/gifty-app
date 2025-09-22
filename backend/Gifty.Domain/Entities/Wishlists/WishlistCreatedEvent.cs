using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.Wishlists;

public class WishlistCreatedEvent(Wishlist wishlist) : IDomainEvent
{
    public Wishlist Wishlist { get; } = wishlist;
}