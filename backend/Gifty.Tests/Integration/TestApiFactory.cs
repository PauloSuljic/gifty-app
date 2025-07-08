using System.Net.Http.Headers;
using gifty_web_backend;
using gifty_web_backend.Utils;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Gifty.Infrastructure;
using Moq;
using Gifty.Domain.Entities;
using Gifty.Infrastructure.Services;

namespace Gifty.Tests.Integration
{
    public class TestApiFactory : WebApplicationFactory<StartupWrapper>
    {
        private const string InMemoryDbName = "SharedTestDb";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string>
                {
                    { "UseTestAuth", "true" }
                }!);
            });

            builder.ConfigureServices(services =>
            {
                services.AddAuthentication("Test")
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });

                services.PostConfigure<AuthenticationOptions>(options =>
                {
                    options.DefaultAuthenticateScheme = "Test";
                    options.DefaultChallengeScheme = "Test";
                });

                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<GiftyDbContext>));

                if (descriptor != null)
                    services.Remove(descriptor);

                services.AddDbContext<GiftyDbContext>(options =>
                {
                    options.UseInMemoryDatabase(InMemoryDbName);
                });

                // Remove the actual IFirebaseAuthService implementation
                // Look for the interface now
                var firebaseAuthServiceDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IFirebaseAuthService)); 
                if (firebaseAuthServiceDescriptor != null)
                {
                    services.Remove(firebaseAuthServiceDescriptor);
                }

                // --- CRITICAL CHANGE HERE: Mock your IFirebaseAuthService ---
                var mockFirebaseAuthService = new Mock<IFirebaseAuthService>();
                mockFirebaseAuthService.Setup(m => m.AuthenticateUserAsync(It.IsAny<string>()))
                                       .ReturnsAsync((string token) =>
                                       {
                                           var userId = token.Replace("mock-firebase-token-for-", "");

                                           // Return a mock User object that would be returned by your AuthenticateUserAsync
                                           // This simulates a successful authentication and user creation/retrieval
                                           return new User
                                           {
                                               Id = userId,
                                               Username = $"TestUser_{userId.Substring(0, 6)}",
                                               Email = $"test_{userId.Substring(0, 6)}@example.com",
                                               CreatedAt = DateTime.UtcNow
                                           };
                                       });

                // Add the mocked interface to the service collection
                services.AddSingleton(mockFirebaseAuthService.Object); 
            });
        }

        public HttpClient CreateClientWithTestAuth(string userId)
        {
            var client = CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test", userId);
            return client;
        }
    }
}