using Gifty.Domain.Entities.Wishlists;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.Wishlists.EventHandlers;

public class WishlistsReorderedEventHandler(ILogger<WishlistsReorderedEventHandler> logger) 
    : INotificationHandler<WishlistReorderedEvent>
{
    public Task Handle(WishlistReorderedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Wishlist reordered: {WishlistId} for user {OwnerId}. New order: {Order}",
            notification.Wishlist.Id,
            notification.Wishlist.UserId,
            notification.Wishlist.Order
        );

        return Task.CompletedTask;
    }
}