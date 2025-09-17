using Gifty.Domain.Entities;
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