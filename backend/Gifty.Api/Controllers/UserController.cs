using System.Security.Claims;
using Gifty.Application.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR; 
using Gifty.Application.Features.Users.Queries; 
using Gifty.Application.Features.Users.Commands;

namespace gifty_web_backend.Controllers
{
    [Authorize]
    [Route("api/users")]
    [ApiController]
    public class UserController(IMediator mediator) : ControllerBase
    {
        [HttpGet("{firebaseUid}")]
        public async Task<ActionResult<UserDto>> GetUserByFirebaseUid(string firebaseUid)
        {
            var query = new GetUserByIdQuery(firebaseUid);
            var userDto = await mediator.Send(query);
            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto request)
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

            var userDto = await mediator.Send(command);
            return CreatedAtAction(nameof(GetUserByFirebaseUid), new { firebaseUid = userDto.Id }, userDto);
        }

        [HttpPut("{firebaseUid}")]
        public async Task<ActionResult<UserDto>> UpdateUserProfile(string firebaseUid, [FromBody] UpdateUserDto model)
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

            var userDto = await mediator.Send(command);
            return Ok(userDto);
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

            await mediator.Send(command);
            return NoContent();
        }
    }    
}