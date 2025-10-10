using Gifty.Domain.Entities.Notifications;

namespace Gifty.Domain.Interfaces
{
    public interface INotificationRepository
    {
        Task AddAsync(Notification notification);
        Task<Notification?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<List<Notification>> GetAllByUserIdAsync(string userId, CancellationToken cancellationToken);
        Task<int> GetUnreadCountByUserIdAsync(string userId, CancellationToken cancellationToken);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}