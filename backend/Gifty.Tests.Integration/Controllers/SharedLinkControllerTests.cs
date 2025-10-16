using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Domain.Entities.Users;
using Gifty.Tests.Integration.Integration;

namespace Gifty.Tests.Integration.Controllers;

[Collection("IntegrationTestCollection")]
public class SharedLinkControllerTests
{
    private readonly HttpClient _client;
    private readonly TestApiFactory _factory;
    private readonly string _userId = "shared-user-id";

    public SharedLinkControllerTests(TestApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClientWithTestAuth(_userId);
    }

    private async Task<WishlistDto> CreateWishlistAsync(string name = "Shared Wishlist")
    {
        await _client.PostAsJsonAsync("/api/users", new User
        {
            Id = _userId,
            Username = "Test",
            Email = "test@example.com",
            Bio = "integration test",
            DateOfBirth = new DateOnly(2000, 1, 1)
        });
        
        var dto = new { Name = name, IsPublic = false };
        var res = await _client.PostAsJsonAsync("/api/wishlists", dto);
        res.EnsureSuccessStatusCode();
        
        var wishlist = await res.Content.ReadFromJsonAsync<WishlistDto>();
        return wishlist!;
    }

    [Fact]
    public async Task GenerateShareLink_ShouldReturnNewCode_IfNoneExists()
    {
        var wishlist = await CreateWishlistAsync();

        var response = await _client.PostAsync($"/api/shared-links/{wishlist.Id}/generate", null);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var data = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        data.Should().ContainKey("shareCode");
    }

    [Fact]
    public async Task GenerateShareLink_ShouldReturnSameCode_IfExists()
    {
        var wishlist = await CreateWishlistAsync();

        var first = await _client.PostAsync($"/api/shared-links/{wishlist.Id}/generate", null);
        first.EnsureSuccessStatusCode();

        var firstCode = (await first.Content.ReadFromJsonAsync<Dictionary<string, string>>())?["shareCode"];

        var second = await _client.PostAsync($"/api/shared-links/{wishlist.Id}/generate", null);
        second.EnsureSuccessStatusCode();

        var secondCode = (await second.Content.ReadFromJsonAsync<Dictionary<string, string>>())?["shareCode"];

        firstCode.Should().Be(secondCode);
    }

    [Fact]
    public async Task GetSharedWishlist_ShouldReturn404_IfInvalidCode()
    {
        var anonClient = _factory.CreateClient();

        var response = await anonClient.GetAsync("/api/shared-links/invalid-code");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GenerateShareLink_ShouldReturn403_IfUserNotOwner()
    {
        var ownerId = "owner-user-id";
        var ownerClient = _factory.CreateClientWithTestAuth(ownerId);

        await ownerClient.PostAsJsonAsync("/api/users", new User
        {
            Id = ownerId,
            Username = $"Owner_{Guid.NewGuid()}",
            Email = $"owner_{Guid.NewGuid()}@test.com",
            Bio = "integration test"
        });

        var dto = new { Name = "Owner's Wishlist", IsPublic = false };
        var res = await ownerClient.PostAsJsonAsync("/api/wishlists", dto);
        res.EnsureSuccessStatusCode();

        var wishlist = await res.Content.ReadFromJsonAsync<WishlistDto>();

        var otherUserClient = _factory.CreateClientWithTestAuth("other-user-id");
        var response = await otherUserClient.PostAsync($"/api/shared-links/{wishlist!.Id}/generate", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

}
