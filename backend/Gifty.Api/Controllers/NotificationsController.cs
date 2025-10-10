using System.Security.Claims;
using Gifty.Application.Features.Notifications.Commands;
using Gifty.Application.Features.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Gifty.Application.Notifications.Commands;
using Gifty.Application.Notifications.Queries;

namespace gifty_web_backend.Controllers
{
    [Authorize]
    [Route("api/notifications")]
    [ApiController]
    public class NotificationsController(IMediator mediator) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated.");

            var query = new GetNotificationsQuery(userId);
            var notifications = await mediator.Send(query, ct);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated.");

            var query = new GetUnreadCountQuery(userId);
            var unreadCount = await mediator.Send(query, ct);
            return Ok(unreadCount);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNotificationCommand cmd, CancellationToken ct)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User not authenticated.");

            // Enforce the command to use the authenticated user ID
            var command = cmd with { UserId = userId };
            var notificationId = await mediator.Send(command, ct);
            return Ok(notificationId);
        }

        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAsRead([FromBody] MarkNotificationAsReadCommand cmd, CancellationToken ct)
        {
            var result = await mediator.Send(cmd, ct);
            return result ? Ok() : NotFound("Notification not found.");
        }
    }
}