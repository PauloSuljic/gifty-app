using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.Wishlists;

public class WishlistRenamedEvent(Wishlist wishlist) : IDomainEvent
{
    public Wishlist Wishlist { get; } = wishlist;
}