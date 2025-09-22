using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.WishlistItems.Events;

public class WishlistItemPartiallyUpdatedEvent(WishlistItem item) : IDomainEvent
{
    public WishlistItem Item { get; } = item;
}