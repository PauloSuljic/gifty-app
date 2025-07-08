using FirebaseAdmin.Auth;
using Gifty.Domain.Entities;

namespace Gifty.Infrastructure.Services
{
    public interface IFirebaseAuthService
    {
        Task<User?> AuthenticateUserAsync(string token);
        // Add any other FirebaseAuth methods your application uses, e.g.:
        // Task<UserRecord> GetUserAsync(string uid, CancellationToken cancellationToken = default);
        // Task DeleteUserAsync(string uid, CancellationToken cancellationToken = default);
    }
}