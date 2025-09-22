using Gifty.Domain.Entities.Wishlists;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.Wishlists.EventHandlers;

public class WishlistCreatedEventHandler(ILogger<WishlistCreatedEventHandler> logger) : INotificationHandler<WishlistCreatedEvent>
{
    public Task Handle(WishlistCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist created: {WishlistId}, {Name}, Owner: {OwnerId}",
            notification.Wishlist.Id,
            notification.Wishlist.Name,
            notification.Wishlist.UserId);

        return Task.CompletedTask;
    }
}