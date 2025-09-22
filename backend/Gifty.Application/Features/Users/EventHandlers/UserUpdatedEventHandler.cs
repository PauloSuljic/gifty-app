using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.Users.Events;

namespace Gifty.Application.Features.Users.EventHandlers;

public class UserUpdatedEventHandler(ILogger<UserUpdatedEventHandler> logger) : INotificationHandler<UserUpdatedEvent>
{
    public Task Handle(UserUpdatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("User updated: {UserId}, {Username}",
            notification.User.Id,
            notification.User.Username);

        return Task.CompletedTask;
    }
}