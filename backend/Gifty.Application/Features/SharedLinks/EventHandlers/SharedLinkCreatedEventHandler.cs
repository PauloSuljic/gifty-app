using Gifty.Domain.Entities.SharedLinks;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.SharedLinks.EventHandlers;

public class SharedLinkCreatedEventHandler(ILogger<SharedLinkCreatedEventHandler> logger)
    : INotificationHandler<SharedLinkCreatedEvent>
{
    public Task Handle(SharedLinkCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Shared link {ShareCode} created for wishlist {WishlistId}", 
            notification.SharedLink.ShareCode, notification.SharedLink.WishlistId);

        return Task.CompletedTask;
    }
}