using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemUpdatedEventHandler(ILogger<WishlistItemUpdatedEventHandler> logger)
    : INotificationHandler<WishlistItemUpdatedEvent>
{
    public Task Handle(WishlistItemUpdatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist item {ItemId} updated in wishlist {WishlistId}",
            notification.Item.Id, notification.Item.WishlistId);
        return Task.CompletedTask;
    }
}