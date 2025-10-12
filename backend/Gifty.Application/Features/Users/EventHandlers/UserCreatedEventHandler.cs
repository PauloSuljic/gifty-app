using MediatR;
using Microsoft.Extensions.Logging;
using Gifty.Domain.Entities.Users.Events;

namespace Gifty.Application.Features.Users.EventHandlers;

public class UserCreatedEventHandler(ILogger<UserCreatedEventHandler> logger) : INotificationHandler<UserCreatedEvent>
{
    public Task Handle(UserCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation("User created: {UserId}, {Username}, {Email}, {DateOfBirth}",
            notification.User.Id,
            notification.User.Username,
            notification.User.Email,
            notification.User.DateOfBirth);

        return Task.CompletedTask;
    }
}