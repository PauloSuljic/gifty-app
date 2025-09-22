using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.Wishlists;

public class WishlistDeletedEvent(Wishlist wishlist) : IDomainEvent
{
    public Wishlist Wishlist { get; } = wishlist;
}