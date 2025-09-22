using Gifty.Domain.Entities.SharedLinks;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.SharedLinks.EventHandlers;

public class SharedLinkVisitedEventHandler(ILogger<SharedLinkVisitedEventHandler> logger)
    : INotificationHandler<SharedLinkVisitedEvent>
{
    public Task Handle(SharedLinkVisitedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("Shared link {LinkId} visited by user {UserId} at {VisitedAt}", 
            notification.Visit.SharedLinkId, notification.Visit.UserId, notification.Visit.VisitedAt);

        return Task.CompletedTask;
    }
}