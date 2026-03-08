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
        public async Task CreateUser_ShouldAllowDuplicateUsernames_ForDifferentUserIds()
        {
            var duplicateUsername = "Paulo Suljic";

            var firstUserId = $"dup-name-1-{Guid.NewGuid():N}";
            var firstClient = factory.CreateClientWithTestAuth(firstUserId);
            var firstUser = BuildUserDto(
                duplicateUsername,
                $"dup_name_1_{Guid.NewGuid():N}@example.com",
                "First user"
            );

            var firstResponse = await firstClient.PostAsJsonAsync("/api/users", firstUser);
            firstResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var secondUserId = $"dup-name-2-{Guid.NewGuid():N}";
            var secondClient = factory.CreateClientWithTestAuth(secondUserId);
            var secondUser = BuildUserDto(
                duplicateUsername,
                $"dup_name_2_{Guid.NewGuid():N}@example.com",
                "Second user"
            );

            var secondResponse = await secondClient.PostAsJsonAsync("/api/users", secondUser);
            secondResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdSecond = await secondResponse.Content.ReadFromJsonAsync<UserDto>();
            createdSecond.Should().NotBeNull();
            createdSecond?.Username.Should().Be(duplicateUsername);
        }

        [Fact]
        public async Task GetUserByFirebaseUid_ShouldReturnUser_WhenExists()
        {
            var userId = "fetch-me";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
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
        public async Task CreateUser_WithoutDateOfBirth_ShouldPersistNullDateOfBirth()
        {
            var userId = "no-dob-user";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                $"NoDob_{Guid.NewGuid()}",
                $"nodob_{Guid.NewGuid()}@example.com",
                "No birthday yet"
            );

            var createResponse = await client.PostAsJsonAsync("/api/users", user);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var created = await createResponse.Content.ReadFromJsonAsync<UserDto>();
            created.Should().NotBeNull();
            created?.DateOfBirth.Should().BeNull();

            var getResponse = await client.GetAsync($"/api/users/{userId}");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var fetched = await getResponse.Content.ReadFromJsonAsync<UserDto>();
            fetched.Should().NotBeNull();
            fetched?.DateOfBirth.Should().BeNull();
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
        public async Task UpdateUser_ShouldAllowBirthdayOnlyUpdate_WithoutUsername()
        {
            var userId = $"birthday-only-{Guid.NewGuid():N}";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
                $"BeforeBirthday_{Guid.NewGuid():N}",
                $"birthday_only_{Guid.NewGuid():N}@update.com",
                "Old bio"
            );

            var createResponse = await client.PostAsJsonAsync("/api/users", user);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var updatePayload = new
            {
                Bio = "Old bio",
                DateOfBirth = new DateOnly(1993, 6, 2)
            };

            var updateResponse = await client.PutAsJsonAsync($"/api/users/{userId}", updatePayload);
            updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var updated = await updateResponse.Content.ReadFromJsonAsync<UserDto>();
            updated.Should().NotBeNull();
            updated?.Username.Should().Be(user.Username);
            updated?.DateOfBirth.Should().Be(new DateOnly(1993, 6, 2));
        }

        [Fact]
        public async Task DeleteUser_ShouldReturnNoContent_WhenUserExists()
        {
            var userId = "delete-me";
            var client = factory.CreateClientWithTestAuth(userId);

            var user = BuildUserDto(
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

        private static CreateUserDto BuildUserDto(string username, string email, string? bio = null, string? avatarUrl = null)
            => new CreateUserDto
            {
                Username = username,
                Email = email,
                Bio = bio,
                AvatarUrl = avatarUrl
            };
    }
}
