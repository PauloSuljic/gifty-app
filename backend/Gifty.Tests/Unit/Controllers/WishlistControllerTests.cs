using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Gifty.Infrastructure;
using Gifty.Domain.Entities;
using gifty_web_backend.Controllers;
using gifty_web_backend.DTOs;

namespace Gifty.Tests.Unit.Controllers
{
    public class WishlistControllerTests
    {
        private GiftyDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<GiftyDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new GiftyDbContext(options);
        }

        private ClaimsPrincipal GetFakeUser(string userId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            return new ClaimsPrincipal(identity);
        }

        private WishlistController GetControllerWithUser(GiftyDbContext dbContext, string userId)
        {
            var controller = new WishlistController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = GetFakeUser(userId)
                    }
                }
            };
            return controller;
        }

        [Fact]
        public async Task CreateWishlist_ShouldCreate_WhenUserIsAuthenticated()
        {
            var db = GetDbContext();
            var userId = "test-user-id";
            var controller = GetControllerWithUser(db, userId);

            var dto = new CreateWishlistDto
            {
                Name = "Birthday Gifts",
                IsPublic = false
            };

            var result = await controller.CreateWishlist(dto);

            var createdResult = result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult.StatusCode.Should().Be(201);
            (await db.Wishlists.CountAsync()).Should().Be(1);
        }

        [Fact]
        public async Task GetUserWishlists_ShouldReturnOnlyUserWishlists()
        {
            var db = GetDbContext();
            var userId = "user-a";
            var otherUserId = "user-b";

            db.Wishlists.AddRange(
                new Wishlist { Id = Guid.NewGuid(), Name = "A1", UserId = userId },
                new Wishlist { Id = Guid.NewGuid(), Name = "A2", UserId = userId },
                new Wishlist { Id = Guid.NewGuid(), Name = "B1", UserId = otherUserId }
            );
            await db.SaveChangesAsync();

            var controller = GetControllerWithUser(db, userId);

            var result = await controller.GetUserWishlists();
            var okResult = result as OkObjectResult;
            var wishlists = okResult?.Value as List<WishlistDto>;

            wishlists.Should().NotBeNull();
            wishlists.Count.Should().Be(2);
            wishlists.All(w => w.UserId == userId).Should().BeTrue();
        }
        
        
        
        [Fact]
        public async Task RenameWishlist_ShouldForbid_WhenUserIsNotOwner()
        {
            var db = GetDbContext();
            var ownerId = "owner-1";
            var hackerId = "hacker-2";

            var wishlist = new Wishlist { Id = Guid.NewGuid(), Name = "Top Secret", UserId = ownerId };
            db.Wishlists.Add(wishlist);
            await db.SaveChangesAsync();

            var controller = GetControllerWithUser(db, hackerId);

            var result = await controller.RenameWishlist(wishlist.Id, "Hacked");

            result.Should().BeOfType<ForbidResult>();
        }
        
        [Fact]
        public async Task DeleteWishlist_ShouldDelete_WhenUserIsOwner()
        {
            var db = GetDbContext();
            var userId = "user-xyz";
            var wishlist = new Wishlist { Id = Guid.NewGuid(), Name = "To Delete", UserId = userId };
            db.Wishlists.Add(wishlist);
            await db.SaveChangesAsync();

            var controller = GetControllerWithUser(db, userId);

            var result = await controller.DeleteWishlist(wishlist.Id);

            result.Should().BeOfType<NoContentResult>();
            (await db.Wishlists.FindAsync(wishlist.Id)).Should().BeNull();
        }

    }
}