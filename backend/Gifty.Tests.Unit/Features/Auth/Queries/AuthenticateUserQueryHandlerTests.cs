using Moq;
using Gifty.Application.Features.Auth.Queries;
using Gifty.Domain.Interfaces;
using Gifty.Domain.Entities;
using FluentAssertions;

namespace Gifty.Tests.Unit.Features.Auth.Queries
{
    public class AuthenticateUserQueryHandlerTests
    {
        [Fact]
        public async Task Handle_ValidToken_ReturnsUserDto()
        {
            // Arrange
            var mockFirebaseAuthService = new Mock<IFirebaseAuthService>();
            var handler = new AuthenticateUserHandler(mockFirebaseAuthService.Object);

            var testToken = "valid_firebase_token";
            var firebaseUser = new User
            {
                Id = "firebaseUid123",
                Username = "testuser",
                Email = "test@example.com",
                Bio = "Test Bio",
                AvatarUrl = "http://example.com/avatar.jpg"
            };

            mockFirebaseAuthService
                .Setup(s => s.AuthenticateUserAsync(It.IsAny<string>()))
                .ReturnsAsync(firebaseUser);

            var query = new AuthenticateUserQuery(testToken);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(firebaseUser.Id);
            result.Username.Should().Be(firebaseUser.Username);
            result.Email.Should().Be(firebaseUser.Email);
            result.Bio.Should().Be(firebaseUser.Bio);
            result.AvatarUrl.Should().Be(firebaseUser.AvatarUrl);

            mockFirebaseAuthService.Verify(s => s.AuthenticateUserAsync(testToken), Times.Once);
        }

        [Fact]
        public async Task Handle_InvalidToken_ReturnsNull()
        {
            // Arrange
            var mockFirebaseAuthService = new Mock<IFirebaseAuthService>();
            var handler = new AuthenticateUserHandler(mockFirebaseAuthService.Object);

            var testToken = "invalid_firebase_token";

            mockFirebaseAuthService
                .Setup(s => s.AuthenticateUserAsync(It.IsAny<string>()))
                .ReturnsAsync((User?)null);

            var query = new AuthenticateUserQuery(testToken);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().BeNull();

            mockFirebaseAuthService.Verify(s => s.AuthenticateUserAsync(testToken), Times.Once);
        }
    }
}