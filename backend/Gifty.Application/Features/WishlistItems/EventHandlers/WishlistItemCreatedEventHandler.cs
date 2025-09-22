using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemCreatedEventHandler(ILogger<WishlistItemCreatedEventHandler> logger) 
    : INotificationHandler<WishlistItemCreatedEvent>
{
    public Task Handle(WishlistItemCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist item {ItemId} created in wishlist {WishlistId}",
            notification.Item.Id, notification.Item.WishlistId);
        return Task.CompletedTask;
    }
}