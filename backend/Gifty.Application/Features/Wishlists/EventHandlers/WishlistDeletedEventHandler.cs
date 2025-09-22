using Gifty.Domain.Entities.Wishlists;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.Wishlists.EventHandlers;

public class WishlistDeletedEventHandler(ILogger<WishlistDeletedEventHandler> logger) : INotificationHandler<WishlistDeletedEvent>
{
    public Task Handle(WishlistDeletedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist deleted: {WishlistId}, {Name}, Owner: {OwnerId}",
            notification.Wishlist.Id,
            notification.Wishlist.Name,
            notification.Wishlist.UserId);

        return Task.CompletedTask;
    }
}