using System.Security.Claims;
using Gifty.Application.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR; 
using Gifty.Application.Features.Users.Queries; 
using Gifty.Application.Features.Users.Commands;
using Gifty.Application.Common.Exceptions;

namespace gifty_web_backend.Controllers
{
    [Authorize]
    [Route("api/users")]
    [ApiController]
    public class UserController(IMediator mediator) : ControllerBase
    {
        [HttpGet("{firebaseUid}")]
        public async Task<IActionResult> GetUserByFirebaseUid(string firebaseUid)
        {
            var query = new GetUserByIdQuery(firebaseUid);
            try
            {
                var userDto = await mediator.Send(query);
                return Ok(userDto);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the user.", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto request)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
            {
                return Unauthorized("User not authenticated.");
            }

            if (firebaseUid != request.Id)
            {
                return Forbid("You can only create a profile for your own Firebase account.");
            }

            var command = new CreateUserCommand(
                request.Id,
                request.Username,
                request.Email,
                request.Bio,
                request.AvatarUrl
            );

            try
            {
                var userDto = await mediator.Send(command);
                return CreatedAtAction(nameof(GetUserByFirebaseUid), new { firebaseUid = userDto.Id }, userDto);
            }
            catch (ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (NotFoundException ex) // If the associated Firebase user somehow doesn't exist
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the user.", details = ex.Message });
            }
        }

        [HttpPut("{firebaseUid}")]
        public async Task<IActionResult> UpdateUserProfile(string firebaseUid, [FromBody] UpdateUserDto model)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken) || userIdFromToken != firebaseUid)
            {
                return Forbid("You can only update your own profile.");
            }

            var command = new UpdateUserCommand(
                firebaseUid,
                model.Username!,
                model.Bio,
                model.AvatarUrl
            );

            try
            {
                var userDto = await mediator.Send(command);
                return Ok(userDto);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the user profile.", details = ex.Message });
            }
        }

        [HttpDelete("{firebaseUid}")]
        public async Task<IActionResult> DeleteUser(string firebaseUid)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken) || userIdFromToken != firebaseUid)
            {
                return Forbid("You can only delete your own profile.");
            }

            var command = new DeleteUserCommand(firebaseUid);

            try
            {
                await mediator.Send(command);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the user.", details = ex.Message });
            }
        }
    }    
}