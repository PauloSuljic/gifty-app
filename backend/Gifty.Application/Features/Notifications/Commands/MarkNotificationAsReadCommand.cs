using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Notifications.Commands;

public record MarkNotificationAsReadCommand(Guid Id) : IRequest<bool>;

public class MarkNotificationAsReadCommandHandler(INotificationRepository notificationRepository)
    : IRequestHandler<MarkNotificationAsReadCommand, bool>
{
    public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await notificationRepository.FindByIdAsync(request.Id, cancellationToken);

        if (notification is null)
            return false;

        notification.IsRead = true;
        await notificationRepository.SaveChangesAsync(cancellationToken);

        return true;
    }
}