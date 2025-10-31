using Gifty.Domain.Entities;

namespace Gifty.Domain.Interfaces
{
    public interface IWishlistItemRepository
    {
        Task<WishlistItem?> GetByIdAsync(Guid id);
        Task AddAsync(WishlistItem item);
        Task UpdateAsync(WishlistItem item);
        Task DeleteAsync(WishlistItem item);
        Task SaveChangesAsync();
        Task<IEnumerable<WishlistItem>> GetAllByWishlistIdAsync(Guid wishlistId);
        Task<int> GetMaxOrderAsync(Guid wishlistId);
    }
}