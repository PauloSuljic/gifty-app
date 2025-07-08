using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Gifty.Domain.Entities;
using Gifty.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using gifty_web_backend.DTOs;

namespace gifty_web_backend.Controllers; 

[Authorize]
[Route("api/wishlists/{wishlistId}/items")] 
[ApiController]
public class WishlistItemController(GiftyDbContext context) : ControllerBase
{
    // ✅ Add a new item to a wishlist 
    [HttpPost]
    public async Task<IActionResult> AddWishlistItem(Guid wishlistId, [FromBody] CreateWishlistItemDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized("User not authenticated.");
        
        var wishlist = await context.Wishlists.FindAsync(wishlistId);
        if (wishlist == null) return NotFound(new { error = "Wishlist not found." });
        if (wishlist.UserId != userId) return Forbid("You are not authorized to add items to this wishlist.");

        var item = new WishlistItem
        {
            Name = dto.Name,
            Link = dto.Link,
            WishlistId = wishlistId,
            CreatedAt = DateTime.UtcNow,
            IsReserved = false,
            ReservedBy = null
        };

        context.WishlistItems.Add(item);
        await context.SaveChangesAsync();
        
        var createdItemDto = new WishlistItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Link = item.Link,
            IsReserved = item.IsReserved,
            ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt,
            WishlistId = item.WishlistId
        };

        return Ok(createdItemDto);
    }

    // ✅ Get items for a specific wishlist
    [HttpGet]
    public async Task<IActionResult> GetWishlistItems(Guid wishlistId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");

        var wishlist = await context.Wishlists.FindAsync(wishlistId);
        if (wishlist == null) return NotFound("Wishlist not found.");
        
        if (!wishlist.IsPublic && wishlist.UserId != userId)
        {
            return Forbid("You do not have permission to view this wishlist.");
        }

        var items = await context.WishlistItems
            .Where(i => i.WishlistId == wishlistId)
            .OrderBy(i => i.CreatedAt)
            .ToListAsync();
        
        var itemDtos = items.Select(i => new WishlistItemDto
        {
            Id = i.Id,
            Name = i.Name,
            Link = i.Link,
            IsReserved = i.IsReserved,
            ReservedBy = i.ReservedBy,
            CreatedAt = i.CreatedAt,
            WishlistId = i.WishlistId
        }).ToList();

        return Ok(itemDtos);
    }
    
    [HttpDelete("{itemId}")]
    public async Task<IActionResult> DeleteWishlistItem(Guid itemId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");

        var item = await context.WishlistItems.FindAsync(itemId);
        if (item == null) return NotFound("Item not found.");
        
        var wishlist = await context.Wishlists.FindAsync(item.WishlistId);
        if (wishlist == null || wishlist.UserId != userId)
            return Forbid("You are not allowed to delete this item.");

        context.WishlistItems.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }

    // ✅ Toggle reservation (PATCH) - Update to return DTO
    [HttpPatch("{itemId}/reserve")]
    public async Task<IActionResult> ToggleReserveItem(Guid itemId)
    {
        var item = await context.WishlistItems.FindAsync(itemId);
        if (item == null) return NotFound(new { error = "Item not found." });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");
        
        var wishlist = await context.Wishlists.Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.Id == item.WishlistId);
        if (wishlist == null) return NotFound("Wishlist not found.");

        if (wishlist.UserId != userId && !wishlist.IsPublic)
        {
            return Forbid("You do not have permission to reserve/unreserve items on this private wishlist.");
        }

        if (item.IsReserved)
        {
            if (item.ReservedBy != userId)
                return Forbid("You cannot unreserve an item reserved by someone else.");

            item.IsReserved = false;
            item.ReservedBy = null;
        }
        else
        {
            if (wishlist.UserId != userId)
            {
                 bool hasReservedItem = wishlist.Items.Any(i => i.IsReserved && i.ReservedBy == userId);
                 if (hasReservedItem)
                     return BadRequest(new { error = "You can only reserve 1 item per wishlist." });
            }

            item.IsReserved = true;
            item.ReservedBy = userId;
        }

        await context.SaveChangesAsync();
        
        return Ok(new WishlistItemDto
        {
            Id = item.Id, Name = item.Name, Link = item.Link,
            IsReserved = item.IsReserved, ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt, WishlistId = item.WishlistId
        });
    }
    
    // ✅ Update an existing wishlist item
    [HttpPatch("{itemId}")]
    public async Task<IActionResult> UpdateWishlistItem(Guid itemId, [FromBody] UpdateWishlistItemDto dto) 
    {
        var item = await context.WishlistItems.FindAsync(itemId);
        if (item == null) return NotFound(new { error = "Item not found." });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");

        var wishlist = await context.Wishlists.FindAsync(item.WishlistId);
        if (wishlist == null || wishlist.UserId != userId)
            return Forbid("You are not allowed to edit this item.");

        if (dto.Name != null)
            item.Name = dto.Name;

        if (dto.Link != null) 
            item.Link = dto.Link;

        await context.SaveChangesAsync();
        
        return Ok(new WishlistItemDto
        {
            Id = item.Id, Name = item.Name, Link = item.Link,
            IsReserved = item.IsReserved, ReservedBy = item.ReservedBy,
            CreatedAt = item.CreatedAt, WishlistId = item.WishlistId
        });
    }
}