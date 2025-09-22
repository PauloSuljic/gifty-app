using MediatR;
using Gifty.Domain.Entities.Users.Events;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Features.Users.EventHandlers;

public class UserDeletedEventHandler(ILogger<UserDeletedEventHandler> logger) : INotificationHandler<UserDeletedEvent>
{
    public Task Handle(UserDeletedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("User deleted: {UserId}, {Username}",
            notification.User.Id,
            notification.User.Username);
        return Task.CompletedTask;
    }
}