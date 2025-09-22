using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.Wishlists;

public class WishlistReorderedEvent(Wishlist wishlist) : IDomainEvent
{
    public Wishlist Wishlist { get; } = wishlist;
}