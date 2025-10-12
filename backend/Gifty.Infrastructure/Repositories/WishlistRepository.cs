using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Repositories
{
    public class WishlistRepository(GiftyDbContext dbContext) : IWishlistRepository
    {
        public async Task<Wishlist?> GetByIdAsync(Guid id)
        {
            return await dbContext.Wishlists
                .Include(w => w.Items)
                .SingleOrDefaultAsync(w => w.Id == id);
        }

        public async Task<string?> GetOwnerUserIdByWishlistId(Guid wishlistId, CancellationToken cancellationToken)
        {
            return await dbContext.Wishlists
                .Where(w => w.Id == wishlistId)
                .Select(w => w.UserId)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<IEnumerable<Wishlist>> GetAllByUserIdAsync(string userId)
        {
            return await dbContext.Wishlists
                .Where(w => w.UserId == userId)
                .Include(w => w.Items)
                .OrderBy(w => w.Order)
                .ToListAsync();
        }

        public async Task AddAsync(Wishlist wishlist)
        {
            await dbContext.Wishlists.AddAsync(wishlist);
        }

        public Task UpdateAsync(Wishlist wishlist)
        {
            dbContext.Wishlists.Update(wishlist);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Wishlist wishlist)
        {
            dbContext.Wishlists.Remove(wishlist);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
    }
}