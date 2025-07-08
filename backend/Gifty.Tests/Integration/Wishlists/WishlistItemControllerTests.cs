using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using gifty_web_backend.DTOs;

namespace Gifty.Tests.Integration.Wishlists;

[Collection("IntegrationTestCollection")]
public class WishlistItemControllerTests
{
    private readonly HttpClient _client;
    private readonly string _userId;

    public WishlistItemControllerTests(TestApiFactory factory)
    {
        _userId = Guid.NewGuid().ToString();
        _client = factory.CreateClientWithTestAuth(_userId);
    }
    
    private async Task CreateTestUser(string userId, HttpClient client)
    {
        var mockFirebaseIdToken = $"mock-firebase-token-for-{userId}";
        var loginDto = new TokenRequestDto { Token = mockFirebaseIdToken };
        var onboardingResponse = await client.PostAsJsonAsync("/api/auth/login", loginDto);

        if (!onboardingResponse.IsSuccessStatusCode && onboardingResponse.StatusCode != HttpStatusCode.Conflict)
        {
            var body = await onboardingResponse.Content.ReadAsStringAsync();
            throw new Exception($"Failed to onboard test user via /api/auth/login ({onboardingResponse.StatusCode}):\n{body}");
        }
        
        var userUpdateDto = new UpdateUserDto 
        {
            Username = "Test User",
            Bio = "Test Bio",
            AvatarUrl = "http://example.com/avatar.png" 
        };
        
        var updateProfileResponse = await client.PutAsJsonAsync($"/api/users/{userId}", userUpdateDto);
        if (!updateProfileResponse.IsSuccessStatusCode)
        {
            var updateBody = await updateProfileResponse.Content.ReadAsStringAsync();
            throw new Exception($"Failed to update test user profile ({updateProfileResponse.StatusCode}):\n{updateBody}");
        }
    }

    private async Task<WishlistDto> CreateWishlistAsync() 
    {
        await CreateTestUser(_userId, _client); 

        var createWishlistDto = new CreateWishlistDto
        {
            Name = "Wishlist with items",
            IsPublic = false
        };

        var res = await _client.PostAsJsonAsync("/api/wishlists", createWishlistDto);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        return await res.Content.ReadFromJsonAsync<WishlistDto>() ?? throw new Exception("Failed to create wishlist");
    }

    [Fact]
    public async Task AddWishlistItem_ShouldSucceed_WhenValid()
    {
        var wishlist = await CreateWishlistAsync();
        
        var itemDto = new CreateWishlistItemDto
        {
            Name = "Cool Item",
            Link = "https://example.com"
        };
        
        var response = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var created = await response.Content.ReadFromJsonAsync<WishlistItemDto>();
        created.Should().NotBeNull();
        created.Name.Should().Be("Cool Item");
        created.Link.Should().Be("https://example.com");
        created.WishlistId.Should().Be(wishlist.Id);
    }

    [Fact]
    public async Task AddWishlistItem_ShouldFail_IfWishlistMissing()
    {
        var itemDto = new CreateWishlistItemDto
        {
            Name = "Invalid",
            Link = "https://nope.com"
        };
        
        var nonExistentWishlistId = Guid.NewGuid();
        var response = await _client.PostAsJsonAsync($"/api/wishlists/{nonExistentWishlistId}/items", itemDto);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AddWishlistItem_ShouldFail_IfNameMissing()
    {
        var wishlist = await CreateWishlistAsync();

        var itemDto = new CreateWishlistItemDto
        {
            Name = "",
            Link = "https://something.com"
        };
        
        var response = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetWishlistItems_ShouldReturnItems()
    {
        var wishlist = await CreateWishlistAsync();
        
        var itemDto = new CreateWishlistItemDto
        {
            Name = "Item 1",
            Link = "https://1.com"
        };
        await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        
        var response = await _client.GetAsync($"/api/wishlists/{wishlist.Id}/items");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var items = await response.Content.ReadFromJsonAsync<List<WishlistItemDto>>();
        items.Should().HaveCount(1);
        items[0].Name.Should().Be("Item 1");
    }
    
    [Fact]
    public async Task ToggleReservation_ShouldReserve_IfNoneReservedYet()
    {
        var wishlist = await CreateWishlistAsync();

        var itemDto = new CreateWishlistItemDto
        {
            Name = "Reserve me",
            Link = "https://reserve.com"
        };
        var createRes = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        var created = await createRes.Content.ReadFromJsonAsync<WishlistItemDto>();
        
        var reserveRes = await _client.PatchAsync($"/api/wishlists/{wishlist.Id}/items/{created!.Id}/reserve", null);
        reserveRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var reserved = await reserveRes.Content.ReadFromJsonAsync<WishlistItemDto>();
        reserved!.IsReserved.Should().BeTrue();
        reserved.ReservedBy.Should().Be(_userId);
    }

    [Fact]
    public async Task ToggleReservation_ShouldFail_IfUserAlreadyReservedAnother()
    {
        var wishlist = await CreateWishlistAsync();

        var item1Dto = new CreateWishlistItemDto { Name = "Item 1", Link = "x" };
        var item2Dto = new CreateWishlistItemDto { Name = "Item 2", Link = "y" };

        var res1 = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", item1Dto);
        var res2 = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", item2Dto);

        var i1 = await res1.Content.ReadFromJsonAsync<WishlistItemDto>();
        var i2 = await res2.Content.ReadFromJsonAsync<WishlistItemDto>();
        
        await _client.PatchAsync($"/api/wishlists/{wishlist.Id}/items/{i1!.Id}/reserve", null);
        
        var conflict = await _client.PatchAsync($"/api/wishlists/{wishlist.Id}/items/{i2!.Id}/reserve", null);
        conflict.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ToggleReservation_ShouldUnreserve_IfReserverMatches()
    {
        var wishlist = await CreateWishlistAsync();

        var itemDto = new CreateWishlistItemDto { Name = "To unreserve", Link = "z" };
        var res = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        var created = await res.Content.ReadFromJsonAsync<WishlistItemDto>();
        
        await _client.PatchAsync($"/api/wishlists/{wishlist.Id}/items/{created!.Id}/reserve", null);
        
        var unreserve = await _client.PatchAsync($"/api/wishlists/{wishlist.Id}/items/{created.Id}/reserve", null);
        unreserve.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await unreserve.Content.ReadFromJsonAsync<WishlistItemDto>();
        result!.IsReserved.Should().BeFalse();
        result.ReservedBy.Should().BeNull();
    }

    [Fact]
    public async Task UpdateWishlistItem_ShouldChangeNameAndLink()
    {
        var wishlist = await CreateWishlistAsync();

        var itemDto = new CreateWishlistItemDto { Name = "Old Name", Link = "http://old.com" };
        var res = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        var created = await res.Content.ReadFromJsonAsync<WishlistItemDto>();
        
        var updateDto = new UpdateWishlistItemDto
        {
            Name = "New Name",
            Link = "https://new.com"
        };
        
        var updateRes = await _client.PatchAsJsonAsync($"/api/wishlists/{wishlist.Id}/items/{created!.Id}", updateDto);
        updateRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var updated = await updateRes.Content.ReadFromJsonAsync<WishlistItemDto>();
        updated!.Name.Should().Be("New Name");
        updated.Link.Should().Be("https://new.com");
    }

    [Fact]
    public async Task DeleteWishlistItem_ShouldRemoveItem()
    {
        var wishlist = await CreateWishlistAsync();

        var itemDto = new CreateWishlistItemDto { Name = "Remove me", Link = "https://rip.com" };
        var res = await _client.PostAsJsonAsync($"/api/wishlists/{wishlist.Id}/items", itemDto);
        var created = await res.Content.ReadFromJsonAsync<WishlistItemDto>();
        
        var deleteRes = await _client.DeleteAsync($"/api/wishlists/{wishlist.Id}/items/{created!.Id}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
        var getItems = await _client.GetAsync($"/api/wishlists/{wishlist.Id}/items");
        getItems.EnsureSuccessStatusCode(); 
        
        var items = await getItems.Content.ReadFromJsonAsync<List<WishlistItemDto>>();
        items.Should().NotContain(i => i.Id == created.Id);
    }
}