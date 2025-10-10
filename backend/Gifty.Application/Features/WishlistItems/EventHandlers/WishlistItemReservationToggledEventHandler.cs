using Gifty.Application.Features.Notifications.Commands;
using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemReservationToggledEventHandler(ILogger<WishlistItemReservationToggledEventHandler> logger, IMediator mediator)
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
        
        // Only notify owner if item is now reserved
        if (notification.Item.IsReserved && notification.Item.Wishlist is not null)
        {
            await mediator.Send(new CreateNotificationCommand(
                UserId: notification.Item.Wishlist.UserId,
                Type: "ItemReserved",
                Title: "An item in your wishlist was reserved 🎁",
                Message: "Someone reserved one of your wishlist items! Add more items so your friends have options."
            ), cancellationToken);
        }
    }
}