using gifty_web_backend.DTOs;
using Gifty.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace gifty_web_backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IFirebaseAuthService firebaseAuthService) : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] TokenRequestDto request)
        {
            if (request.Token == null)
            {
                return BadRequest(new { message = "Authentication token is required." });
            }

            var user = await firebaseAuthService.AuthenticateUserAsync(request.Token);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid or expired token, or authentication failed." });
            }
            
            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                Email = user.Email 
            });
        }
    }
}
