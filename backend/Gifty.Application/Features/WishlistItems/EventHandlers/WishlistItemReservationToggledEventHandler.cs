using Gifty.Application.Features.Notifications.Commands;
using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;
using Gifty.Domain.Interfaces;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemReservationToggledEventHandler(ILogger<WishlistItemReservationToggledEventHandler> logger, IMediator mediator, IWishlistRepository wishlistRepository)
    : INotificationHandler<WishlistItemReservationToggledEvent>
{
    public async Task Handle(WishlistItemReservationToggledEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "WishlistItemReservationToggled: Item {ItemId}, Reserved={IsReserved}, ByUser={UserId}",
            notification.Item.Id,
            notification.Item.IsReserved,
            notification.Item.ReservedBy
        );
        
        if (!notification.Item.IsReserved) return;

        // Resolve wishlist owner even if navigation property is not loaded
        var ownerUserId = notification.Item.Wishlist?.UserId;
        if (string.IsNullOrEmpty(ownerUserId))
        {
            ownerUserId = await wishlistRepository.GetOwnerUserIdByWishlistId(notification.Item.WishlistId, cancellationToken);
        }
        if (string.IsNullOrEmpty(ownerUserId))
        {
            logger.LogWarning("Wishlist owner could not be resolved for WishlistId={WishlistId}", notification.Item.WishlistId);
            return;
        }
            
        await mediator.Send(new CreateNotificationCommand(
            UserId: ownerUserId,
            Type: "ItemReserved",
            Title: "An item in your wishlist was reserved",
            Message: "Someone reserved one of your wishlist items! Add more items so your friends have options."
        ), cancellationToken);
    }
}