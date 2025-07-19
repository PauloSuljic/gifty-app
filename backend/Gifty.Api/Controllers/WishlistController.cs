using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Features.Wishlists.Commands;
using Gifty.Application.Features.Wishlists.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Application.Features.Wishlists.Queries;

namespace gifty_web_backend.Controllers
{
    [Authorize]
    [Route("api/wishlists")]
    [ApiController]
    public class WishlistController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistDto>>> GetAllWishlists()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }
            
            var query = new GetWishlistsByUserIdQuery(userId); 
            try
            {
                var wishlists = await mediator.Send(query);
                return Ok(wishlists);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving wishlists.", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WishlistDto>> GetWishlistById(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var query = new GetWishlistByIdQuery(id, userId);

            try
            {
                var wishlist = await mediator.Send(query);
                return Ok(wishlist);
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
                return StatusCode(500, new { message = "An error occurred while retrieving the wishlist.", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<WishlistDto>> CreateWishlist([FromBody] CreateWishlistDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new CreateWishlistCommand(
                userId,
                request.Name,
                request.IsPublic,
                request.Order
            );

            try
            {
                var wishlistDto = await mediator.Send(command);
                return CreatedAtAction(nameof(GetWishlistById), new { id = wishlistDto.Id }, wishlistDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the wishlist.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<WishlistDto>> UpdateWishlist(Guid id, [FromBody] UpdateWishlistDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }
            
            var command = new UpdateWishlistCommand(
                id,
                userId,
                request.Name,
                request.IsPublic,
                request.Order
            );

            try
            {
                var wishlistDto = await mediator.Send(command);
                return Ok(wishlistDto);
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
                return StatusCode(500, new { message = "An error occurred while updating the wishlist.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWishlist(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new DeleteWishlistCommand(id, userId);

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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the wishlist.", details = ex.Message });
            }
        }
        
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderWishlists([FromBody] List<ReorderWishlistDto> reordered)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new ReorderWishlistsCommand(userId, reordered);

            try
            {
                await mediator.Send(command);
                return Ok(); 
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while reordering wishlists.", details = ex.Message });
            }
        }
        
        [HttpPatch("{id}")]
        public async Task<ActionResult<WishlistDto>> RenameWishlist(Guid id, [FromBody] string newName)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new RenameWishlistCommand(id, userId, newName);

            try
            {
                var updatedWishlist = await mediator.Send(command);
                return Ok(updatedWishlist);
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
                return StatusCode(500, new { message = "An error occurred while renaming the wishlist.", details = ex.Message });
            }
        }
    }
}