using Gifty.Application.Features.Auth.Dtos;
using Gifty.Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Common.Exceptions;

namespace gifty_web_backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IMediator mediator) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TokenRequestDto request)
        {
            if (request.Token == null)
            {
                return BadRequest(new { message = "Authentication token is required." });
            }
            
            var query = new AuthenticateUserQuery(request.Token);
            
            try
            {
                var userDto = await mediator.Send(query);

                if (userDto == null)
                {
                    return Unauthorized(new { message = "Invalid or expired token, or authentication failed." });
                }
                
                return Ok(userDto);
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
                return StatusCode(500, new { message = "An unexpected error occurred during authentication.", details = ex.Message });
            }
        }
    }
}