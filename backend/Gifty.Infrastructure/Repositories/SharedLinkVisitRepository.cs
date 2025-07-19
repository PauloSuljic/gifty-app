using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Repositories
{
    public class SharedLinkVisitRepository(GiftyDbContext dbContext) : ISharedLinkVisitRepository
    {
        public async Task<SharedLinkVisit?> GetVisitByUserAndSharedLinkAsync(string userId, Guid sharedLinkId)
        {
            return await dbContext.SharedLinkVisits
                .SingleOrDefaultAsync(v => v.UserId == userId && v.SharedLinkId == sharedLinkId);
        }

        public async Task<IEnumerable<SharedLinkVisit>> GetVisitsByUserIdAsync(string userId)
        {
            return await dbContext.SharedLinkVisits
                .Include(v => v.SharedLink!)
                .ThenInclude(l => l.Wishlist!)
                .ThenInclude(w => w.Items)
                .Include(v => v.SharedLink!.Wishlist!.User)
                .Where(v => v.UserId == userId)
                .ToListAsync();
        }

        public async Task AddAsync(SharedLinkVisit visit)
        {
            await dbContext.SharedLinkVisits.AddAsync(visit);
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
    }
}