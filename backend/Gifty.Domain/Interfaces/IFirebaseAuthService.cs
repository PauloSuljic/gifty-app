using Gifty.Domain.Entities;

namespace Gifty.Domain.Interfaces
{
    public interface IFirebaseAuthService
    {
        Task<User?> AuthenticateUserAsync(string token);
    }
}