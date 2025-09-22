using Gifty.Domain.Entities.Wishlists;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.Wishlists.EventHandlers;

public class WishlistRenamedEventHandler(ILogger<WishlistRenamedEventHandler> logger) 
    : INotificationHandler<WishlistRenamedEvent>
{
    public Task Handle(WishlistRenamedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Wishlist renamed: {WishlistId}, new name: {NewName}, Owner: {OwnerId}",
            notification.Wishlist.Id,
            notification.Wishlist.Name,
            notification.Wishlist.UserId);

        return Task.CompletedTask;
    }
}