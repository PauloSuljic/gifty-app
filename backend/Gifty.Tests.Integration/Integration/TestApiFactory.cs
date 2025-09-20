using System.Net.Http.Headers;
using gifty_web_backend;
using gifty_web_backend.Utils;
using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using Gifty.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace Gifty.Tests.Integration.Integration
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

                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<GiftyDbContext>));

                if (descriptor != null)
                    services.Remove(descriptor);

                services.AddDbContext<GiftyDbContext>(options =>
                {
                    options.UseInMemoryDatabase(InMemoryDbName);
                });
                
                var firebaseAuthServiceDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IFirebaseAuthService)); 
                if (firebaseAuthServiceDescriptor != null)
                {
                    services.Remove(firebaseAuthServiceDescriptor);
                }
                
                var mockFirebaseAuthService = new Mock<IFirebaseAuthService>();
                mockFirebaseAuthService.Setup(m => m.AuthenticateUserAsync(It.IsAny<string>()))
                                       .Returns((string token) =>
                                       {
                                           var userId = token.Replace("mock-firebase-token-for-", "");
                                           
                                           var serviceProvider = services.BuildServiceProvider();
                                           var dbContext = serviceProvider.GetRequiredService<GiftyDbContext>();

                                           var user = dbContext.Users.FirstOrDefault(u => u.Id == userId);
                                           if (user == null)
                                           {
                                               user = new User
                                               {
                                                   Id = userId,
                                                   Username = $"TestUser_{userId.Substring(0, 6)}",
                                                   Email = $"test_{userId.Substring(0, 6)}@example.com",
                                                   CreatedAt = DateTime.UtcNow
                                               };
                                               dbContext.Users.Add(user);
                                               dbContext.SaveChanges();
                                           }
                               
                                           return Task.FromResult<User?>(user);
                                       });
                
                services.AddSingleton(mockFirebaseAuthService.Object); 
            });
        }

        public HttpClient CreateClientWithTestAuth(string userId)
        {
            var client = CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", userId);
            return client;
        }
    }
}