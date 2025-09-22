using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Features.Wishlists.Commands;
using Gifty.Application.Features.Wishlists.Dtos;
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
            var wishlists = await mediator.Send(query);
            return Ok(wishlists);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WishlistDto>> GetWishlistById(Guid id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var query = new GetWishlistByIdQuery(id, userId);

            var wishlist = await mediator.Send(query);
            return Ok(wishlist);
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

            var wishlistDto = await mediator.Send(command);
            return CreatedAtAction(nameof(GetWishlistById), new { id = wishlistDto.Id }, wishlistDto);
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

            var wishlistDto = await mediator.Send(command);
            return Ok(wishlistDto);
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

            await mediator.Send(command);
            return NoContent();
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

            await mediator.Send(command);
            return Ok(); 
        }
        
        [HttpPatch("{id}")]
        public async Task<ActionResult<WishlistDto>> RenameWishlist(Guid id, [FromBody] RenameWishlistDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var command = new RenameWishlistCommand(id, userId, request.Name);

            var updatedWishlist = await mediator.Send(command);
            return Ok(updatedWishlist);
        }
    }
}