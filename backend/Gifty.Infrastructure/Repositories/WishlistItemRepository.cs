using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Repositories
{
    public class WishlistItemRepository(GiftyDbContext dbContext) : IWishlistItemRepository
    {
        public async Task<WishlistItem?> GetByIdAsync(Guid id)
        {
            return await dbContext.WishlistItems.SingleOrDefaultAsync(i => i.Id == id);
        }

        public async Task AddAsync(WishlistItem item)
        {
            await dbContext.WishlistItems.AddAsync(item);
        }

        public Task UpdateAsync(WishlistItem item)
        {
            dbContext.WishlistItems.Update(item);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(WishlistItem item)
        {
            dbContext.WishlistItems.Remove(item);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
        
        public async Task<IEnumerable<WishlistItem>> GetAllByWishlistIdAsync(Guid wishlistId)
        {
            return await dbContext.WishlistItems
                .Where(item => item.WishlistId == wishlistId)
                .ToListAsync();
        }
    }
}