using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.WishlistItems.Events;

namespace Gifty.Application.Features.WishlistItems.EventHandlers;

public class WishlistItemReservationToggledEventHandler(ILogger<WishlistItemReservationToggledEventHandler> logger)
    : INotificationHandler<WishlistItemReservationToggledEvent>
{
    public Task Handle(WishlistItemReservationToggledEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "WishlistItemReservationToggled: Item {ItemId}, Reserved={IsReserved}, ByUser={UserId}",
            notification.Item.Id,
            notification.Item.IsReserved,
            notification.Item.ReservedBy
        );

        return Task.CompletedTask;
    }
}