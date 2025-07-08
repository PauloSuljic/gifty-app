using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Gifty.Domain.Entities;
using gifty_web_backend.DTOs; // Make sure this is included for DTOs

namespace Gifty.Tests.Integration.Wishlists;

[Collection("IntegrationTestCollection")]
public class WishlistItemControllerTests
{
    
    private readonly HttpClient _client;
    private readonly string _userId;

    public WishlistItemControllerTests(TestApiFactory factory) // Inject TestApiFactory
    {
        // Assign the injected factory
        _userId = Guid.NewGuid().ToString();
        _client = factory.CreateClientWithTestAuth(_userId);
    }

    // Re-add the CreateTestUser method here, identical to the one in WishlistControllerTests
    private async Task CreateTestUser(string userId, HttpClient client)
    {
        // 1. Authenticate the user (this hits our mocked IFirebaseAuthService)
        var mockFirebaseIdToken = $"mock-firebase-token-for-{userId}";
        var loginDto = new TokenRequestDto { Token = mockFirebaseIdToken };
        var onboardingResponse = await client.PostAsJsonAsync("/api/auth/login", loginDto);

        if (!onboardingResponse.IsSuccessStatusCode && onboardingResponse.StatusCode != HttpStatusCode.Conflict)
        {
            var body = await onboardingResponse.Content.ReadAsStringAsync();
            throw new Exception($"Failed to onboard test user via /api/auth/login ({onboardingResponse.StatusCode}):\n{body}");
        }

        // 2. Now that the user is "authenticated" via our test scheme,
        //    if your /api/users endpoint is for updating a *profile* for an already logged-in user,
        //    then you should call it here.
        //    If /api/users is for initial *creation* of a user record linked to Firebase UID,
        //    and that creation is automatically handled by /api/auth/login, then this step might be redundant
        //    or need adjustment based on your actual UserController logic.

        // Assuming your /api/users endpoint is for setting profile details after first login:
        var userUpdateDto = new UpdateUserDto // Make sure UpdateUserDto exists and matches your API
        {
            Username = "Test User",
            Bio = "Test Bio",
            AvatarUrl = "http://example.com/avatar.png" // Include other fields as needed
        };

        // The POST to /api/users is likely handled automatically by /api/auth/login now,
        // which automatically creates the user record if it doesn't exist.
        // So, if /api/users is only for *updates* you might need a PUT/PATCH here, or skip entirely
        // if login auto-creates the initial user record.

        // Let's assume for now that the /api/users endpoint handles profile *updates* for the authenticated user.
        // So, you might need to use PUT or PATCH to /api/users/{userId}
        var updateProfileResponse = await client.PutAsJsonAsync($"/api/users/{userId}", userUpdateDto);
        // You might also check if it's 200 OK or 204 No Content for a successful update.
        if (!updateProfileResponse.IsSuccessStatusCode)
        {
            var updateBody = await updateProfileResponse.Content.ReadAsStringAsync();
            throw new Exception($"Failed to update test user profile ({updateProfileResponse.StatusCode}):\n{updateBody}");
        }
    }

    private async Task<Wishlist> CreateWishlistAsync()
    {
        // CRITICAL: Ensure the user exists before creating a wishlist for them
        await CreateTestUser(_userId, _client); 

        var wishlist = new Wishlist
        {
            Name = "Wishlist with items",
            UserId = _userId
        };

        var res = await _client.PostAsJsonAsync("/api/wishlists", wishlist);
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        return await res.Content.ReadFromJsonAsync<Wishlist>() ?? throw new Exception("Failed to create wishlist");
    }

    [Fact]
    public async Task AddWishlistItem_ShouldSucceed_WhenValid()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem
        {
            Name = "Cool Item",
            Link = "https://example.com",
            WishlistId = wishlist.Id
        };

        var response = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var created = await response.Content.ReadFromJsonAsync<WishlistItem>();
        created.Should().NotBeNull();
        created.Name.Should().Be("Cool Item");
    }

    [Fact]
    public async Task AddWishlistItem_ShouldFail_IfWishlistMissing()
    {
        var item = new WishlistItem
        {
            Name = "Invalid",
            Link = "https://nope.com",
            WishlistId = Guid.NewGuid() // non-existent
        };

        var response = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task AddWishlistItem_ShouldFail_IfNameMissing()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem
        {
            Name = "",
            Link = "https://something.com",
            WishlistId = wishlist.Id
        };

        var response = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GetWishlistItems_ShouldReturnItems()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem
        {
            Name = "Item 1",
            Link = "https://1.com",
            WishlistId = wishlist.Id
        };

        await _client.PostAsJsonAsync("/api/wishlist-items", item);

        var response = await _client.GetAsync($"/api/wishlist-items/{wishlist.Id}");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var items = await response.Content.ReadFromJsonAsync<List<WishlistItem>>();
        items.Should().HaveCount(1);
        items[0].Name.Should().Be("Item 1");
    }
    
    [Fact]
    public async Task ToggleReservation_ShouldReserve_IfNoneReservedYet()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem
        {
            Name = "Reserve me",
            Link = "https://reserve.com",
            WishlistId = wishlist.Id
        };

        var createRes = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        var created = await createRes.Content.ReadFromJsonAsync<WishlistItem>();

        var reserveRes = await _client.PatchAsync($"/api/wishlist-items/{created!.Id}/reserve", null);
        reserveRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var reserved = await reserveRes.Content.ReadFromJsonAsync<WishlistItem>();
        reserved!.IsReserved.Should().BeTrue();
        reserved.ReservedBy.Should().Be(_userId);
    }

    [Fact]
    public async Task ToggleReservation_ShouldFail_IfUserAlreadyReservedAnother()
    {
        var wishlist = await CreateWishlistAsync();

        var item1 = new WishlistItem { Name = "Item 1", Link = "x", WishlistId = wishlist.Id };
        var item2 = new WishlistItem { Name = "Item 2", Link = "y", WishlistId = wishlist.Id };

        var res1 = await _client.PostAsJsonAsync("/api/wishlist-items", item1);
        var res2 = await _client.PostAsJsonAsync("/api/wishlist-items", item2);

        var i1 = await res1.Content.ReadFromJsonAsync<WishlistItem>();
        var i2 = await res2.Content.ReadFromJsonAsync<WishlistItem>();

        await _client.PatchAsync($"/api/wishlist-items/{i1!.Id}/reserve", null);

        var conflict = await _client.PatchAsync($"/api/wishlist-items/{i2!.Id}/reserve", null);
        conflict.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ToggleReservation_ShouldUnreserve_IfReserverMatches()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem { Name = "To unreserve", Link = "z", WishlistId = wishlist.Id };
        var res = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        var created = await res.Content.ReadFromJsonAsync<WishlistItem>();

        await _client.PatchAsync($"/api/wishlist-items/{created!.Id}/reserve", null);

        var unreserve = await _client.PatchAsync($"/api/wishlist-items/{created.Id}/reserve", null);
        unreserve.StatusCode.Should().Be(HttpStatusCode.OK);

        var result = await unreserve.Content.ReadFromJsonAsync<WishlistItem>();
        result!.IsReserved.Should().BeFalse();
        result.ReservedBy.Should().BeNull();
    }

    [Fact]
    public async Task UpdateWishlistItem_ShouldChangeNameAndLink()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem { Name = "Old Name", Link = "http://old.com", WishlistId = wishlist.Id };
        var res = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        var created = await res.Content.ReadFromJsonAsync<WishlistItem>();

        var update = new
        {
            Name = "New Name",
            Link = "https://new.com"
        };

        var updateRes = await _client.PatchAsJsonAsync($"/api/wishlist-items/{created!.Id}", update);
        updateRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var updated = await updateRes.Content.ReadFromJsonAsync<WishlistItem>();
        updated!.Name.Should().Be("New Name");
        updated.Link.Should().Be("https://new.com");
    }

    [Fact]
    public async Task DeleteWishlistItem_ShouldRemoveItem()
    {
        var wishlist = await CreateWishlistAsync();

        var item = new WishlistItem { Name = "Remove me", Link = "https://rip.com", WishlistId = wishlist.Id };
        var res = await _client.PostAsJsonAsync("/api/wishlist-items", item);
        var created = await res.Content.ReadFromJsonAsync<WishlistItem>();

        var deleteRes = await _client.DeleteAsync($"/api/wishlist-items/{created!.Id}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getItems = await _client.GetAsync($"/api/wishlist-items/{wishlist.Id}");
        var items = await getItems.Content.ReadFromJsonAsync<List<WishlistItem>>();

        items.Should().NotContain(i => i.Id == created.Id);
    }
}