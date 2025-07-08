using System.Security.Claims;
using gifty_web_backend.DTOs;
using Gifty.Domain.Entities;
using Gifty.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace gifty_web_backend.Controllers;

[Route("api/shared-links")]
[ApiController]
public class SharedLinkController(GiftyDbContext context) : ControllerBase
{
    [Authorize]
    [HttpGet("shared-with-me")]
    public async Task<IActionResult> GetWishlistsSharedWithMe()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");
        
        var visitedWishlists = await context.SharedLinkVisits
            .Include(v => v.SharedLink!)
                .ThenInclude(l => l.Wishlist!)
                    .ThenInclude(w => w.Items)
            .Include(v => v.SharedLink!.Wishlist!.User) 
            .Where(v => v.UserId == userId && v.SharedLink!.Wishlist!.UserId != userId)
            .ToListAsync();

        if (!visitedWishlists.Any()) return Ok(new List<SharedWithMeWishlistOwnerGroupDto>());

        var result = visitedWishlists
            .GroupBy(v => new 
            {
                OwnerId = v.SharedLink!.Wishlist!.UserId,
                OwnerUsername = v.SharedLink!.Wishlist!.User?.Username,
                OwnerAvatarUrl = v.SharedLink!.Wishlist!.User?.AvatarUrl 
            })
            .Select(group => new SharedWithMeWishlistOwnerGroupDto
            {
                OwnerId = group.Key.OwnerId,
                OwnerName = group.Key.OwnerUsername,
                OwnerAvatar = group.Key.OwnerAvatarUrl,
                Wishlists = group.Select(v => new SharedWithMeWishlistDto
                {
                    Id = v.SharedLink!.Wishlist!.Id,
                    Name = v.SharedLink.Wishlist.Name,
                    Items = v.SharedLink.Wishlist.Items
                        .Select(i => new WishlistItemDto
                        {
                            Id = i.Id,
                            Name = i.Name,
                            Link = i.Link,
                            IsReserved = i.IsReserved,
                            ReservedBy = i.ReservedBy,
                            CreatedAt = i.CreatedAt,
                            WishlistId = i.WishlistId
                        }).ToList()
                }).ToList()
            }).ToList();

        return Ok(result);
    }

    [Authorize]
    [HttpPost("{wishlistId}/generate")]
    public async Task<IActionResult> GenerateShareLink(Guid wishlistId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized("User not authenticated.");

        var wishlist = await context.Wishlists.FindAsync(wishlistId);
        if (wishlist == null) return NotFound("Wishlist not found.");
        if (wishlist.UserId != userId) return Forbid();

        var existingLink = await context.SharedLinks.FirstOrDefaultAsync(l => l.WishlistId == wishlistId);
        if (existingLink != null)
        {
            return Ok(new ShareLinkResponseDto(existingLink.ShareCode));
        }

        var sharedLink = new SharedLink { WishlistId = wishlistId };
        context.SharedLinks.Add(sharedLink);
        await context.SaveChangesAsync();

        return Ok(new ShareLinkResponseDto(sharedLink.ShareCode));
    }


    [AllowAnonymous] 
    [HttpGet("{shareCode}")]
    public async Task<IActionResult> GetSharedWishlist(string shareCode)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var sharedLink = await context.SharedLinks
            .Include(l => l.Wishlist!)
                .ThenInclude(w => w.Items)
            .Include(l => l.Wishlist!.User) 
            .FirstOrDefaultAsync(l => l.ShareCode == shareCode);

        if (sharedLink == null)
            return NotFound(new { error = "Invalid shared link." });
        
        var response = new SharedWishlistResponseDto
        {
            Id = sharedLink.Wishlist!.Id,
            Name = sharedLink.Wishlist.Name,
            OwnerId = sharedLink.Wishlist.UserId,
            OwnerName = sharedLink.Wishlist.User?.Username,
            OwnerAvatar = sharedLink.Wishlist.User?.AvatarUrl, 
            Items = sharedLink.Wishlist.Items
                .Select(i => new WishlistItemDto
                {
                    Id = i.Id,
                    Name = i.Name,
                    Link = i.Link,
                    IsReserved = i.IsReserved,
                    ReservedBy = i.ReservedBy,
                    CreatedAt = i.CreatedAt,
                    WishlistId = i.WishlistId
                }).ToList()
        };

        if (!string.IsNullOrEmpty(userId) && userId != sharedLink.Wishlist!.UserId) 
        {
            var visited = await context.SharedLinkVisits
                .FirstOrDefaultAsync(v => v.UserId == userId && v.SharedLinkId == sharedLink.Id);

            if (visited == null)
            {
                context.SharedLinkVisits.Add(new SharedLinkVisit
                {
                    SharedLinkId = sharedLink.Id,
                    UserId = userId
                });
                await context.SaveChangesAsync();
            }
        }

        return Ok(response);
    }
}