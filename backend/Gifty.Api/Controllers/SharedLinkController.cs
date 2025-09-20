using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Features.SharedLinks.Commands;
using Gifty.Application.Features.SharedLinks.Queries;
using Gifty.Application.Features.SharedLinks.Dtos;
using Gifty.Application.Common.Exceptions;

namespace gifty_web_backend.Controllers;

[Route("api/shared-links")]
[ApiController]
public class SharedLinkController(IMediator mediator) : ControllerBase
{
    [Authorize]
    [HttpGet("shared-with-me")]
    public async Task<ActionResult<IEnumerable<SharedWithMeWishlistOwnerGroupDto>>> GetWishlistsSharedWithMe()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var query = new GetWishlistsSharedWithMeQuery(userId);

        try
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving shared wishlists.", details = ex.Message });
        }
    }
    
    [Authorize]
    [HttpPost("{wishlistId}/generate")]
    public async Task<ActionResult<ShareLinkResponseDto>> GenerateShareLink(Guid wishlistId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User not authenticated.");
        }

        var command = new GenerateShareLinkCommand(wishlistId, userId);

        try
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ForbiddenAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while generating the share link.", details = ex.Message });
        }
    }
    
    [AllowAnonymous]
    [HttpGet("{shareCode}")]
    public async Task<ActionResult<SharedWishlistResponseDto>> GetSharedWishlist(string shareCode)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var query = new GetSharedWishlistQuery(shareCode, userId);

        try
        {
            var response = await mediator.Send(query);
            return Ok(response);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the shared wishlist.", details = ex.Message });
        }
    }
}