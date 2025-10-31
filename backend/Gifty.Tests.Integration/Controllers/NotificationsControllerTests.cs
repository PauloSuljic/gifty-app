using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Gifty.Domain.Entities.Notifications;
using Gifty.Domain.Entities.Users;
using Gifty.Tests.Integration.Integration;

namespace Gifty.Tests.Integration.Controllers;

[Collection("IntegrationTestCollection")]
public class NotificationsControllerTests
{
    private readonly TestApiFactory _factory;
    private readonly HttpClient _client;
    private readonly string _userId;

    public NotificationsControllerTests(TestApiFactory factory)
    {
        _factory = factory;
        _userId = Guid.NewGuid().ToString();
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
    public async Task CreateNotification_ShouldSaveToDatabase()
    {
        // Arrange
        await CreateTestUser(_userId, _client);

        var cmd = new
        {
            UserId = _userId,
            Type = "ItemReserved",
            Title = "Test Notification",
            Message = "This is a test message."
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/notifications", cmd);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var notificationId = await response.Content.ReadFromJsonAsync<Guid>();
        notificationId.Should().NotBeEmpty();

        // Assert
        var listResponse = await _client.GetAsync("/api/notifications");
        listResponse.EnsureSuccessStatusCode();

        var notifications = await listResponse.Content.ReadFromJsonAsync<List<Notification>>();
        notifications.Should().ContainSingle(n => n.Id == notificationId);
    }

    [Fact]
    public async Task GetNotifications_ShouldReturnEmptyList_IfNoNotifications()
    {
        await CreateTestUser(_userId, _client);

        var response = await _client.GetAsync("/api/notifications");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var notifications = await response.Content.ReadFromJsonAsync<List<Notification>>();
        notifications.Should().BeEmpty();
    }

    [Fact]
    public async Task GetUnreadCount_ShouldReturnCorrectCount()
    {
        await CreateTestUser(_userId, _client);

        for (int i = 0; i < 2; i++)
        {
            var cmd = new
            {
                UserId = _userId,
                Type = "GiftReminder",
                Title = $"Reminder {i}",
                Message = "Unread test notification"
            };
            await _client.PostAsJsonAsync("/api/notifications", cmd);
        }

        var countResponse = await _client.GetAsync("/api/notifications/unread-count");
        countResponse.EnsureSuccessStatusCode();

        var count = await countResponse.Content.ReadFromJsonAsync<int>();
        count.Should().Be(2);
    }

    [Fact]
    public async Task MarkAsRead_ShouldSetIsReadTrue()
    {
        await CreateTestUser(_userId, _client);

        var createResponse = await _client.PostAsJsonAsync("/api/notifications", new
        {
            UserId = _userId,
            Type = "ItemReserved",
            Title = "Read Test",
            Message = "Notification to mark as read"
        });
        createResponse.EnsureSuccessStatusCode();

        var notificationId = await createResponse.Content.ReadFromJsonAsync<Guid>();
        notificationId.Should().NotBeEmpty();

        var markResponse = await _client.PostAsJsonAsync("/api/notifications/mark-read", new
        {
            Id = notificationId
        });
        markResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var countResponse = await _client.GetAsync("/api/notifications/unread-count");
        countResponse.EnsureSuccessStatusCode();

        var unread = await countResponse.Content.ReadFromJsonAsync<int>();
        unread.Should().Be(0);
    }

    [Fact]
    public async Task MarkAllAsRead_ShouldMarkAll()
    {
        await CreateTestUser(_userId, _client);

        for (int i = 0; i < 3; i++)
        {
            var cmd = new
            {
                UserId = _userId,
                Type = "Birthday",
                Title = $"Birthday {i}",
                Message = "Unread birthday notification"
            };
            await _client.PostAsJsonAsync("/api/notifications", cmd);
        }

        var markAllResponse = await _client.PostAsync("/api/notifications/mark-read", null);
        markAllResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var countResponse = await _client.GetAsync("/api/notifications/unread-count");
        countResponse.EnsureSuccessStatusCode();

        var unread = await countResponse.Content.ReadFromJsonAsync<int>();
        unread.Should().Be(0);
    }
}