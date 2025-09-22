using Gifty.Domain.Entities.Wishlists;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.Wishlists.EventHandlers;

public class WishlistUpdatedEventHandler(ILogger<WishlistUpdatedEventHandler> logger) : INotificationHandler<WishlistUpdatedEvent>
{
    public Task Handle(WishlistUpdatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist updated: {WishlistId}, {Name}, Owner: {OwnerId}",
            notification.Wishlist.Id,
            notification.Wishlist.Name,
            notification.Wishlist.UserId);

        return Task.CompletedTask;
    }
}