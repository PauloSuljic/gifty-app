using Gifty.Domain.Entities.Users;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Repositories
{
    public class UserRepository(GiftyDbContext dbContext) : IUserRepository
    {
        public async Task<User?> GetByIdAsync(string id)
        {
            return await dbContext.Users.SingleOrDefaultAsync(u => u.Id == id);
        }
        
        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);
        }
        
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await dbContext.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await dbContext.Users.AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<User>> SearchUsersAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return Enumerable.Empty<User>();

            searchTerm = searchTerm.Trim();

            return await dbContext.Users
                .AsNoTracking()
                .Where(u =>
                    EF.Functions.ILike(u.Username, $"%{searchTerm}%") ||
                    EF.Functions.ILike(u.Email, $"%{searchTerm}%"))
                .ToListAsync();
        }

        public async Task AddAsync(User user)
        {
            await dbContext.Users.AddAsync(user);
        }
        
        public Task UpdateAsync(User user)
        {
            dbContext.Users.Update(user);
            return Task.CompletedTask;
        }
        
        public Task DeleteAsync(User user)
        {
            dbContext.Users.Remove(user);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await dbContext.SaveChangesAsync();
        }
    }
}