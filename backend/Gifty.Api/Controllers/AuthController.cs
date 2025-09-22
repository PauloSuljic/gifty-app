using Gifty.Application.Features.Auth.Dtos;
using Gifty.Application.Features.Auth.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

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
            var userDto = await mediator.Send(query);

            if (userDto == null)
            {
                return Unauthorized(new { message = "Invalid or expired token, or authentication failed." });
            }
            
            return Ok(userDto);
        }
    }
}