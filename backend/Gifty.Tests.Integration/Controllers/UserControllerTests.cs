using System.Net;
using System.Net.Http.Json;
using Gifty.Application.Features.Users.Dtos;
using FluentAssertions;
using Gifty.Tests.Integration.Integration;

namespace Gifty.Tests.Integration.Controllers
{
    [Collection("IntegrationTestCollection")]
    public class UserControllerTests(TestApiFactory factory)
    {
        [Fact]
        public async Task CreateUser_ShouldReturnCreated()
        {
            var userId = "firebase-test-id";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                userId,
                $"TestUser_{Guid.NewGuid()}",
                $"test_{Guid.NewGuid()}@example.com",
                "Just testing"
            );

            var response = await client.PostAsJsonAsync("/api/users", user);

            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var created = await response.Content.ReadFromJsonAsync<UserDto>();
            created.Should().NotBeNull();
            created?.Username.Should().Be(user.Username);
        }

        [Fact]
        public async Task CreateUser_ShouldFail_WhenUserAlreadyExists()
        {
            var userId = "duplicate-user";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                userId,
                $"DuplicateUser_{Guid.NewGuid()}",
                $"dup_{Guid.NewGuid()}@example.com",
                "First"
            );

            // First create succeeds
            var response1 = await client.PostAsJsonAsync("/api/users", user);
            response1.StatusCode.Should().Be(HttpStatusCode.Created);

            // Second create should fail (user already exists)
            var response2 = await client.PostAsJsonAsync("/api/users", user);
            response2.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        [Fact]
        public async Task GetUserByFirebaseUid_ShouldReturnUser_WhenExists()
        {
            var userId = "fetch-me";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                userId,
                $"Fetcher_{Guid.NewGuid()}",
                $"fetch_{Guid.NewGuid()}@example.com",
                "Here to be fetched"
            );

            await client.PostAsJsonAsync("/api/users", user);

            var response = await client.GetAsync($"/api/users/{userId}");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var returned = await response.Content.ReadFromJsonAsync<UserDto>();
            returned.Should().NotBeNull();
            returned?.Username.Should().Be(user.Username);
        }

        [Fact]
        public async Task GetUserByFirebaseUid_ShouldReturnNotFound_WhenUserMissing()
        {
            var client = factory.CreateClientWithTestAuth("someone");
            var response = await client.GetAsync("/api/users/non-existent-user");

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateUser_ShouldUpdate_WhenUserExists()
        {
            var userId = "update-me";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                userId,
                $"BeforeUpdate_{Guid.NewGuid()}",
                $"before_{Guid.NewGuid()}@update.com",
                "Old bio"
            );

            await client.PostAsJsonAsync("/api/users", user);

            var updatePayload = new
            {
                Username = "UpdatedUser",
                Bio = "Updated bio",
                AvatarUrl = "/avatars/avatar1.png"
            };

            var response = await client.PutAsJsonAsync($"/api/users/{userId}", updatePayload);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var updated = await response.Content.ReadFromJsonAsync<UserDto>();
            updated.Should().NotBeNull();
            updated?.Username.Should().Be("UpdatedUser");
            updated?.Bio.Should().Be("Updated bio");
            updated?.AvatarUrl.Should().Be("/avatars/avatar1.png");
        }

        [Fact]
        public async Task DeleteUser_ShouldReturnNoContent_WhenUserExists()
        {
            var userId = "delete-me";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                userId,
                $"ToBeDeleted_{Guid.NewGuid()}",
                $"delete_{Guid.NewGuid()}@me.com",
                "I'm doomed"
            );

            await client.PostAsJsonAsync("/api/users", user);

            var response = await client.DeleteAsync($"/api/users/{userId}");

            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            var followUp = await client.GetAsync($"/api/users/{userId}");
            followUp.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task DeleteUser_ShouldReturnNotFound_WhenUserDoesNotExist()
        {
            var client = factory.CreateClientWithTestAuth("ghost-user");
            var response = await client.DeleteAsync("/api/users/ghost-user");

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task UpdateUser_ShouldReturnNotFound_IfUserDoesNotExist()
        {
            var userId = "missing-id";
            var client = factory.CreateClientWithTestAuth(userId);

            var update = new
            {
                Username = "Updated Name",
                Bio = "Updated bio",
                AvatarUrl = "/avatars/avatar3.png"
            };

            var response = await client.PutAsJsonAsync($"/api/users/{userId}", update);

            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        private static CreateUserDto BuildUserDto(string id, string username, string email, string? bio = null, string? avatarUrl = null)
            => new CreateUserDto
            {
                Id = id,
                Username = username,
                Email = email,
                Bio = bio,
                AvatarUrl = avatarUrl
            };
    }
}
