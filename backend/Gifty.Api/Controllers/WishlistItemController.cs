using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Features.WishlistItems.Commands;
using Gifty.Application.Features.WishlistItems.Queries;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;

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
                request.Link
            );

            try
            {
                var wishlistItemDto = await mediator.Send(command);
                return Ok(wishlistItemDto); 
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the wishlist item.", details = ex.Message });
            }
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistItemDto>>> GetWishlistItems(Guid wishlistId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var query = new GetAllWishlistItemsQuery(wishlistId, userId);

            try
            {
                var items = await mediator.Send(query);
                return Ok(items);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving wishlist items.", details = ex.Message });
            }
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

            try
            {
                var item = await mediator.Send(query);
                if (item.WishlistId != wishlistId)
                {
                    return NotFound(new { message = "Wishlist item not found in the specified wishlist." });
                }
                return Ok(item);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the wishlist item.", details = ex.Message });
            }
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

            try
            {
                var updatedItem = await mediator.Send(command);
                return Ok(updatedItem);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the wishlist item.", details = ex.Message });
            }
        }
        
        [HttpPatch("{itemId}")] 
        public async Task<ActionResult<WishlistItemDto>> UpdateWishlistItemPartial(Guid wishlistId, Guid itemId, [FromBody] PatchWishlistItemDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new UpdateWishlistItemPartialCommand(
                itemId,
                wishlistId,
                userId,
                request.Name,
                request.Link
            );

            try
            {
                var updatedItem = await mediator.Send(command);
                return Ok(updatedItem);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while partially updating the wishlist item.", details = ex.Message });
            }
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

            try
            {
                var updatedItem = await mediator.Send(command);
                return Ok(updatedItem);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while toggling reservation.", details = ex.Message });
            }
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

            try
            {
                await mediator.Send(command);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ForbiddenAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the wishlist item.", details = ex.Message });
            }
        }
    }
}