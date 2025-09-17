using Gifty.Domain.Entities;

namespace Gifty.Domain.Interfaces
{
    public interface ISharedLinkVisitRepository
    {
        Task<SharedLinkVisit?> GetVisitByUserAndSharedLinkAsync(string userId, Guid sharedLinkId);
        Task<IEnumerable<SharedLinkVisit>> GetVisitsByUserIdAsync(string userId);
        Task AddAsync(SharedLinkVisit visit);
        Task SaveChangesAsync();
    }
}