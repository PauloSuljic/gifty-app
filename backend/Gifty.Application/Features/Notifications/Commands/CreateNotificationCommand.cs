using Gifty.Domain.Entities.Notifications;
using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Notifications.Commands;

public record CreateNotificationCommand(
    string UserId,
    string Type,
    string Title,
    string Message
) : IRequest<Guid>;

public class CreateNotificationCommandHandler(INotificationRepository notificationRepository)
    : IRequestHandler<CreateNotificationCommand, Guid>
{
    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = new Notification
        {
            UserId = request.UserId,
            Type = request.Type,
            Title = request.Title,
            Message = request.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await notificationRepository.AddAsync(notification);
        await notificationRepository.SaveChangesAsync(cancellationToken);

        return notification.Id;
    }
}