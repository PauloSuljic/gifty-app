using System.Security.Claims;
using gifty_web_backend.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Features.WishlistItems.Commands;
using Gifty.Application.Features.WishlistItems.Dtos;
using Gifty.Application.Features.WishlistItems.Queries;
using Gifty.Application.Features.Wishlists.Dtos;

namespace gifty_web_backend.Controllers
{
    [Authorize]
    [Route("api/wishlists/{wishlistId}/items")]
    [ApiController]
    public class WishlistItemController(IMediator mediator) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<WishlistItemDto>> AddWishlistItem(Guid wishlistId, [FromBody] CreateWishlistItemDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new CreateWishlistItemCommand(
                wishlistId,
                userId,
                request.Name,
                request.Link,
                request.ImageUrl
            );

            var wishlistItemDto = await mediator.Send(command);
            return Ok(wishlistItemDto); 
        }
        
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistItemDto>>> GetWishlistItems(Guid wishlistId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var query = new GetAllWishlistItemsQuery(wishlistId, userId);

            var items = await mediator.Send(query);
            return Ok(items);
        }
        
        [HttpGet("{itemId}")] 
        public async Task<ActionResult<WishlistItemDto>> GetWishlistItemById(Guid wishlistId, Guid itemId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var query = new GetWishlistItemByIdQuery(itemId, userId); 

            var item = await mediator.Send(query);
            if (item.WishlistId != wishlistId)
            {
                return NotFound(new { message = "Wishlist item not found in the specified wishlist." });
            }
            return Ok(item);
        }
        
        [HttpPut("{itemId}")] 
        public async Task<ActionResult<WishlistItemDto>> UpdateWishlistItem(Guid wishlistId, Guid itemId, [FromBody] UpdateWishlistItemDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new UpdateWishlistItemCommand(
                itemId,
                wishlistId,
                userId,
                request.Name,
                request.Link,
                request.IsReserved,
                request.ReservedBy
            );

            var updatedItem = await mediator.Send(command);
            return Ok(updatedItem);
        }
        
        [HttpDelete("{itemId}")]
        public async Task<IActionResult> DeleteWishlistItem(Guid wishlistId, Guid itemId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new DeleteWishlistItemCommand(itemId, wishlistId, userId);

            await mediator.Send(command);
            return NoContent();
        }
        
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderWishlistItems(Guid wishlistId, [FromBody] List<ReorderWishlistItemDto> reordered)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new ReorderWishlistItemsCommand(wishlistId, userId, reordered);

            await mediator.Send(command);
            return Ok();
        }
        
        [HttpPatch("{itemId}/reserve")] 
        public async Task<ActionResult<WishlistItemDto>> ToggleReserveItem(Guid wishlistId, Guid itemId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new ToggleWishlistItemReservationCommand(itemId, wishlistId, userId);

            var updatedItem = await mediator.Send(command);
            return Ok(updatedItem);
        }
        
        [HttpPatch("{itemId}")]
        public async Task<ActionResult<WishlistItemDto>> PatchWishlistItem(
            Guid wishlistId,
            Guid itemId,
            [FromBody] PatchWishlistItemDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated.");

            Stream? imageStream = null;
            string? fileName = null;

            if (request.Image != null)
            {
                imageStream = request.Image.OpenReadStream();
                fileName = request.Image.FileName;
            }

            var command = new UpdateWishlistItemPartialCommand(
                itemId,
                wishlistId,
                userId,
                request.Name,
                request.Link,
                imageStream,
                fileName
            );

            var updatedItem = await mediator.Send(command);
            return Ok(updatedItem);
        }
    }
}