using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using gifty_web_backend.DTOs;
using Gifty.Infrastructure;
using Gifty.Domain.Entities;
using Microsoft.AspNetCore.Authorization;

namespace gifty_web_backend.Controllers; 

[Authorize]
[Route("api/wishlists")]
[ApiController]
public class WishlistController(GiftyDbContext context) : ControllerBase
{
    // ✅ Create a Wishlist
    [HttpPost]
    public async Task<IActionResult> CreateWishlist([FromBody] CreateWishlistDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized("User not authenticated.");

        var wishlist = new Wishlist
        {
            Name = dto.Name,
            IsPublic = dto.IsPublic,
            UserId = userId
        };

        context.Wishlists.Add(wishlist);
        await context.SaveChangesAsync();
        
        var createdWishlistDto = new WishlistDto
        {
            Id = wishlist.Id,
            Name = wishlist.Name,
            IsPublic = wishlist.IsPublic,
            UserId = wishlist.UserId,
            CreatedAt = wishlist.CreatedAt,
            Order = wishlist.Order,
            Items = new List<WishlistItemDto>()
        };

        return CreatedAtAction(nameof(GetUserWishlists), new { userId }, createdWishlistDto);
    }

    // ✅ Get All Wishlists for Logged-in User
    [HttpGet]
    public async Task<IActionResult> GetUserWishlists()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized("User not authenticated.");

        // 🐢 Fallback to DB
        var wishlists = await context.Wishlists
            .Where(w => w.UserId == userId)
            .Include(w => w.Items)
            .OrderBy(w => w.Order)
            .ToListAsync();
        
        var wishlistDtos = wishlists.Select(w => new WishlistDto
        {
            Id = w.Id,
            Name = w.Name,
            IsPublic = w.IsPublic,
            UserId = w.UserId,
            CreatedAt = w.CreatedAt,
            Order = w.Order,
            Items = w.Items.Select(i => new WishlistItemDto
            {
                Id = i.Id,
                Name = i.Name,
                Link = i.Link,
                IsReserved = i.IsReserved,
                ReservedBy = i.ReservedBy,
                CreatedAt = i.CreatedAt,
                WishlistId = i.WishlistId
            }).ToList()
        }).ToList();

        return Ok(wishlistDtos);
    }

    // ✅ Delete a Wishlist
    [HttpDelete("{wishlistId}")]
    public async Task<IActionResult> DeleteWishlist(Guid wishlistId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized("User not authenticated.");
        
        var wishlist = await context.Wishlists
            .Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.Id == wishlistId && w.UserId == userId);

        if (wishlist == null) return NotFound("Wishlist not found or you don't have permission to delete it.");

        context.Wishlists.Remove(wishlist);
        await context.SaveChangesAsync();
        return NoContent();
    }
    
    // ✅ PATCH: Rename Wishlist
    [HttpPatch("{wishlistId}")]
    public async Task<IActionResult> RenameWishlist(Guid wishlistId, [FromBody] string newName)
    {
        var wishlist = await context.Wishlists.FindAsync(wishlistId);
        if (wishlist == null)
            return NotFound(new { error = "Wishlist not found." });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (wishlist.UserId != userId)
            return Forbid();

        wishlist.Name = newName;
        await context.SaveChangesAsync();
        return Ok(wishlist);
    }
    
    // ✅ PUT: Reorder wishlists
    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderWishlists([FromBody] List<ReorderWishlistDto> reordered)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized("User not authenticated.");

        var wishlistIds = reordered.Select(r => r.Id).ToList();

        var wishlists = await context.Wishlists
            .Where(w => w.UserId == userId && wishlistIds.Contains(w.Id))
            .ToListAsync();

        foreach (var wishlist in wishlists)
        {
            var match = reordered.First(r => r.Id == wishlist.Id);
            wishlist.Order = match.Order;
        }

        await context.SaveChangesAsync();
        return Ok();
    }
    
}