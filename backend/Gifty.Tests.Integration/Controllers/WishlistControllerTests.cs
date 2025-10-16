using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Domain.Entities.Users;
using Gifty.Tests.Integration.Integration;

namespace Gifty.Tests.Integration.Controllers
{
    [Collection("IntegrationTestCollection")]
    public class WishlistControllerTests
    {
        private readonly TestApiFactory _factory;
        private readonly HttpClient _client;
        private readonly string _userId = "wishlist-user-id";

        public WishlistControllerTests(TestApiFactory factory)
        {
            _factory = factory;
            _client = _factory.CreateClientWithTestAuth(_userId);
        }

        private async Task CreateTestUser(string userId, HttpClient client)
        {
            var user = new User
            {
                Id = userId,
                Username = $"TestUser_{userId}",
                Email = $"{userId}@test.com",
                Bio = "Test Bio",
                DateOfBirth = new DateOnly(2000, 1, 1)
            };

            var response = await client.PostAsJsonAsync("/api/users", user);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();

                if (response.StatusCode == HttpStatusCode.Conflict && body.Contains("already"))
                    return;

                throw new Exception($"Failed to create user ({response.StatusCode}):\n{body}");
            }
        }

        [Fact]
        public async Task CreateWishlist_ShouldReturnCreated()
        {
            var userId = "integration-user-id-1";
            var client = _factory.CreateClientWithTestAuth(userId);

            await CreateTestUser(userId, client);

            var dto = new CreateWishlistDto { Name = "Integration Wishlist", IsPublic = false };
            var response = await client.PostAsJsonAsync("/api/wishlists", dto);

            response.EnsureSuccessStatusCode();

            var created = await response.Content.ReadFromJsonAsync<WishlistDto>();
            created!.Name.Should().Be("Integration Wishlist");
            created.UserId.Should().Be(userId);
        }

        [Fact]
        public async Task GetUserWishlists_ShouldReturnOnlyCurrentUserWishlists()
        {
            var userId = Guid.NewGuid().ToString();
            var client = _factory.CreateClientWithTestAuth(userId);
            
            var otherUserId = Guid.NewGuid().ToString();
            var otherClient = _factory.CreateClientWithTestAuth(otherUserId);

            await CreateTestUser(userId, client);
            await CreateTestUser(otherUserId, otherClient);

            for (int i = 0; i < 2; i++)
            {
                var dto = new CreateWishlistDto { Name = $"My Wishlist {i}", IsPublic = false };
                var res = await client.PostAsJsonAsync("/api/wishlists", dto);
                res.EnsureSuccessStatusCode();
            }

            var otherDto = new CreateWishlistDto { Name = "Other User List", IsPublic = true };
            var otherRes = await otherClient.PostAsJsonAsync("/api/wishlists", otherDto);
            otherRes.EnsureSuccessStatusCode();

            var response = await client.GetAsync("/api/wishlists");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<List<WishlistDto>>();
            result.Should().NotBeNull();
            result?.Count.Should().Be(2);
            result?.All(w => w.UserId == userId).Should().BeTrue();
        }

        [Fact]
        public async Task RenameWishlist_ShouldUpdateName()
        {
            await CreateTestUser(_userId, _client);

            var dto = new CreateWishlistDto { Name = "Before Rename", IsPublic = false };
            var response = await _client.PostAsJsonAsync("/api/wishlists", dto);
            response.EnsureSuccessStatusCode();

            var created = await response.Content.ReadFromJsonAsync<WishlistDto>();
            
            var renameDto = new RenameWishlistDto { Name = "Renamed List" };
            var renameResponse = await _client.PatchAsJsonAsync($"/api/wishlists/{created!.Id}", renameDto);
            renameResponse.EnsureSuccessStatusCode();

            var renamed = await renameResponse.Content.ReadFromJsonAsync<WishlistDto>();
            renamed!.Name.Should().Be("Renamed List");
        }

        [Fact]
        public async Task DeleteWishlist_ShouldRemoveSuccessfully()
        {
            var userId = "wishlist-user-id-2";
            var client = _factory.CreateClientWithTestAuth(userId);
            await CreateTestUser(userId, client);

            var dto = new CreateWishlistDto { Name = "To Delete", IsPublic = false };
            var response = await client.PostAsJsonAsync("/api/wishlists", dto);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                throw new Exception($"Failed to create user ({response.StatusCode}):\n{body}");
            }

            var created = await response.Content.ReadFromJsonAsync<WishlistDto>();

            var delete = await client.DeleteAsync($"/api/wishlists/{created!.Id}");
            delete.StatusCode.Should().Be(HttpStatusCode.NoContent);

            var check = await client.GetAsync("/api/wishlists");
            check.EnsureSuccessStatusCode();

            var wishlists = await check.Content.ReadFromJsonAsync<List<WishlistDto>>();
            wishlists!.Any(w => w.Id == created.Id).Should().BeFalse();
        }

        [Fact]
        public async Task ReorderWishlists_ShouldRearrangeOrder()
        {
            var userId = Guid.NewGuid().ToString();
            var client = _factory.CreateClientWithTestAuth(userId);
            await CreateTestUser(userId, client);

            var res1 = await client.PostAsJsonAsync("/api/wishlists", new CreateWishlistDto { Name = "List A", IsPublic = false });
            var created1 = await res1.Content.ReadFromJsonAsync<WishlistDto>();

            var res2 = await client.PostAsJsonAsync("/api/wishlists", new CreateWishlistDto { Name = "List B", IsPublic = false });
            var created2 = await res2.Content.ReadFromJsonAsync<WishlistDto>();

            var reorderPayload = new[]
            {
                new ReorderWishlistDto { Id = created2!.Id, Order = 0 },
                new ReorderWishlistDto { Id = created1!.Id, Order = 1 }
            };

            var reorderRes = await client.PutAsJsonAsync("/api/wishlists/reorder", reorderPayload);
            reorderRes.EnsureSuccessStatusCode();

            var finalRes = await client.GetAsync("/api/wishlists");
            finalRes.EnsureSuccessStatusCode();

            var wishlists = await finalRes.Content.ReadFromJsonAsync<List<WishlistDto>>();
            wishlists.Should().NotBeNull().And.HaveCount(2);

            var sorted = wishlists?.OrderBy(w => w.Order).ToList();
            sorted?[0].Id.Should().Be(created2.Id);
            sorted?[1].Id.Should().Be(created1.Id);
        }
    }
}