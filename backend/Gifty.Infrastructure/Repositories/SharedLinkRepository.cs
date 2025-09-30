using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Repositories
{
    public class SharedLinkRepository(GiftyDbContext dbContext) : ISharedLinkRepository
    {
        public async Task<SharedLink?> GetByIdAsync(Guid id)
        {
            return await dbContext.SharedLinks
                .Include(sl => sl.Wishlist)
                    .ThenInclude(w => w!.Items) 
                .Include(sl => sl.Wishlist!.User)
                .SingleOrDefaultAsync(sl => sl.Id == id);
        }

        public async Task<SharedLink?> GetByShareCodeAsync(string shareCode)
        {
            return await dbContext.SharedLinks
                .Include(sl => sl.Wishlist)
                    .ThenInclude(w => w!.Items) 
                .Include(sl => sl.Wishlist!.User)
                .SingleOrDefaultAsync(sl => sl.ShareCode == shareCode);
        }

        public async Task<SharedLink?> GetByWishlistIdAsync(Guid wishlistId)
        {
            return await dbContext.SharedLinks
                .Include(sl => sl.Wishlist)
                    .ThenInclude(w => w!.Items)
                .Include(sl => sl.Wishlist!.User)
                .SingleOrDefaultAsync(sl => sl.WishlistId == wishlistId);
        }

        public async Task AddAsync(SharedLink sharedLink)
        {
            await dbContext.SharedLinks.AddAsync(sharedLink);
        }
        
        public Task UpdateAsync(SharedLink sharedLink)
        {
            dbContext.SharedLinks.Update(sharedLink);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(SharedLink sharedLink)
        {
            dbContext.SharedLinks.Remove(sharedLink);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
        
        public async Task<IEnumerable<SharedLink>> GetByOwnerAndUserAsync(string ownerId, string currentUserId)
        {
            return await dbContext.SharedLinks
                .Include(sl => sl.Wishlist)
                .Where(sl => sl.Wishlist!.UserId == ownerId) 
                .ToListAsync();
        }

        public void RemoveRange(IEnumerable<SharedLink> sharedLinks)
        {
            dbContext.SharedLinks.RemoveRange(sharedLinks);
        }
    }
}