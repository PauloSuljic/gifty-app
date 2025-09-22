using Gifty.Domain.Entities.Users;
using FirebaseAdmin.Auth;
using Gifty.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Gifty.Infrastructure.Services
{
    public class FirebaseAuthService(GiftyDbContext dbContext, ILogger<FirebaseAuthService> logger) : IFirebaseAuthService
    {
        public async Task<User?> AuthenticateUserAsync(string token)
        {
            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                var firebaseUid = decodedToken.Uid;

                // Check if user exists in database
                var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == firebaseUid);

                if (user == null)
                {
                    // Fetch user details from Firebase
                    var firebaseUser = await FirebaseAuth.DefaultInstance.GetUserAsync(firebaseUid);

                    user = new User
                    {
                        Id = firebaseUid,
                        Username = firebaseUser.DisplayName ?? $"user_{firebaseUid.Substring(0, 6)}",
                        AvatarUrl = firebaseUser.PhotoUrl,
                        Bio = "",
                        Email = firebaseUser.Email ?? string.Empty,
                        CreatedAt = DateTime.UtcNow
                    };

                    dbContext.Users.Add(user);
                    await dbContext.SaveChangesAsync();
                }

                return user;
            }
            catch (FirebaseAuthException authEx)
            {
                logger.LogWarning(authEx, "Firebase authentication failed: {ErrorCode} - {Message}", authEx.ErrorCode, authEx.Message);
                return null; 
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred during Firebase authentication.");
                return null;
            }
        }
    }
}
