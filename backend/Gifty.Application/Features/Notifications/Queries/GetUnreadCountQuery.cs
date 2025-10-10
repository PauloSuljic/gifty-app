using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Notifications.Queries;

public record GetUnreadCountQuery(string UserId) : IRequest<int>;

public class GetUnreadCountQueryHandler(INotificationRepository notificationRepository)
    : IRequestHandler<GetUnreadCountQuery, int>
{
    public async Task<int> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        return await notificationRepository.GetUnreadCountByUserIdAsync(request.UserId, cancellationToken);
    }
}