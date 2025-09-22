using Gifty.Domain.Entities.Users;

namespace Gifty.Domain.Interfaces
{
    public interface IFirebaseAuthService
    {
        Task<User?> AuthenticateUserAsync(string token);
    }
}