using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Gifty.Domain.Entities;
using Gifty.Infrastructure;
using Microsoft.AspNetCore.Authorization;

namespace gifty_web_backend.Controllers; 

[Authorize]
[Route("api/wishlist-items")]
[ApiController]
public class WishlistItemController(GiftyDbContext context) : ControllerBase
{
    // ✅ Add a new item to a wishlist
    [HttpPost]
    public async Task<IActionResult> AddWishlistItem([FromBody] WishlistItem item)
    {
        if (string.IsNullOrWhiteSpace(item.Name))
            return BadRequest(new { error = "The item field is required." });

        var wishlist = await context.Wishlists.FindAsync(item.WishlistId);
        if (wishlist == null) return NotFound(new { error = "Wishlist not found." });

        context.WishlistItems.Add(item);
        await context.SaveChangesAsync();

        return Ok(item);
    }

    // ✅ Get items for a specific wishlist
    [HttpGet("{wishlistId:guid}")]
    public async Task<IActionResult> GetWishlistItems(Guid wishlistId)
    {
        // 🐢 Fallback to DB
        var items = await context.WishlistItems
            .Where(i => i.WishlistId == wishlistId)
            .ToListAsync();

        return Ok(items);
    }

    [HttpDelete("{itemId}")]
    public async Task<IActionResult> DeleteWishlistItem(Guid itemId)
    {
        var item = await context.WishlistItems.FindAsync(itemId);
        if (item == null) return NotFound("Item not found.");

        context.WishlistItems.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }

    // ✅ Toggle reservation (PATCH)
    [HttpPatch("{itemId}/reserve")]
    public async Task<IActionResult> ToggleReserveItem(Guid itemId)
    {
        var item = await context.WishlistItems.FindAsync(itemId);
        if (item == null) return NotFound(new { error = "Item not found." });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");

        if (item.IsReserved)
        {
            if (item.ReservedBy != userId)
                return Forbid("You cannot unreserve an item reserved by someone else.");

            item.IsReserved = false;
            item.ReservedBy = null;
        }
        else
        {
            var wishlist = await context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.Id == item.WishlistId);

            if (wishlist == null) return NotFound("Wishlist not found.");

            bool hasReservedItem = wishlist.Items.Any(i => i.IsReserved && i.ReservedBy == userId);
            if (hasReservedItem)
                return BadRequest(new { error = "You can only reserve 1 item per wishlist." });

            item.IsReserved = true;
            item.ReservedBy = userId;
        }

        await context.SaveChangesAsync();

        return Ok(item);
    }
    
    // ✅ Update an existing wishlist item (name and/or link)
    [HttpPatch("{itemId}")]
    public async Task<IActionResult> UpdateWishlistItem(Guid itemId, [FromBody] WishlistItem updated)
    {
        var item = await context.WishlistItems.FindAsync(itemId);
        if (item == null) return NotFound(new { error = "Item not found." });

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authenticated.");

        var wishlist = await context.Wishlists.FindAsync(item.WishlistId);
        if (wishlist == null || wishlist.UserId != userId)
            return Forbid("You are not allowed to edit this item.");

        if (!string.IsNullOrWhiteSpace(updated.Name))
            item.Name = updated.Name;

        if (!string.IsNullOrWhiteSpace(updated.Link))
            item.Link = updated.Link;

        await context.SaveChangesAsync();

        return Ok(item);
    }
    
}
