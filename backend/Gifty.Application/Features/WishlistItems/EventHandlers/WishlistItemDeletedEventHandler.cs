using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemDeletedEventHandler(ILogger<WishlistItemDeletedEventHandler> logger)
    : INotificationHandler<WishlistItemDeletedEvent>
{
    public Task Handle(WishlistItemDeletedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist item {ItemId} deleted from wishlist {WishlistId}",
            notification.Item.Id, notification.Item.WishlistId);
        return Task.CompletedTask;
    }
}