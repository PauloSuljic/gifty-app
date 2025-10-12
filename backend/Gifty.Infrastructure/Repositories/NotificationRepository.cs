using Gifty.Domain.Entities.Notifications;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly GiftyDbContext _context;

        public NotificationRepository(GiftyDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
        }

        public async Task<Notification?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
        }

        public async Task<List<Notification>> GetAllByUserIdAsync(string userId, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetUnreadCountByUserIdAsync(string userId, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync(cancellationToken);
        }

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}