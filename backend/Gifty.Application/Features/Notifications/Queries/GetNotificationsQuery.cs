using Gifty.Domain.Entities.Notifications;
using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(string UserId) : IRequest<List<Notification>>;

public class GetNotificationsQueryHandler(INotificationRepository notificationRepository)
    : IRequestHandler<GetNotificationsQuery, List<Notification>>
{
    public async Task<List<Notification>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await notificationRepository.GetAllByUserIdAsync(request.UserId, cancellationToken);
        return notifications.OrderByDescending(n => n.CreatedAt).ToList();
    }
}