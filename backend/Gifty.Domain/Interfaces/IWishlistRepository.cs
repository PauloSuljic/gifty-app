using Gifty.Domain.Entities;

namespace Gifty.Domain.Interfaces
{
    public interface IWishlistRepository
    {
        Task<Wishlist?> GetByIdAsync(Guid id);
        Task<IEnumerable<Wishlist>> GetAllByUserIdAsync(string userId);
        Task AddAsync(Wishlist wishlist);
        Task UpdateAsync(Wishlist wishlist);
        Task DeleteAsync(Wishlist wishlist);
        Task SaveChangesAsync();
    }
}