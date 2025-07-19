using Gifty.Domain.Entities;

namespace Gifty.Domain.Interfaces
{
    public interface ISharedLinkRepository
    {
        Task<SharedLink?> GetByIdAsync(Guid id);
        Task<SharedLink?> GetByShareCodeAsync(string shareCode);
        Task<SharedLink?> GetByWishlistIdAsync(Guid wishlistId); 
        Task AddAsync(SharedLink sharedLink);
        Task UpdateAsync(SharedLink sharedLink); 
        Task DeleteAsync(SharedLink sharedLink); 
        Task SaveChangesAsync();
    }
}