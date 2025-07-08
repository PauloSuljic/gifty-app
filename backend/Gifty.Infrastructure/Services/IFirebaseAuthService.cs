using Gifty.Domain.Entities;

namespace Gifty.Infrastructure.Services
{
    public interface IFirebaseAuthService
    {
        Task<User?> AuthenticateUserAsync(string token);
    }
}