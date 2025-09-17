using Gifty.Domain.Entities;

namespace Gifty.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetUserByUsernameAsync(string username); 
        Task<User?> GetUserByEmailAsync(string email); 
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);
        Task SaveChangesAsync();
    }
}