using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemPartiallyUpdatedEventHandler(ILogger<WishlistItemPartiallyUpdatedEventHandler> logger)
    : INotificationHandler<WishlistItemPartiallyUpdatedEvent>
{
    public Task Handle(WishlistItemPartiallyUpdatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "WishlistItemPartiallyUpdated: Item {ItemId}, NewName={Name}, Link={Link}",
            notification.Item.Id,
            notification.Item.Name,
            notification.Item.Link
        );

        return Task.CompletedTask;
    }
}