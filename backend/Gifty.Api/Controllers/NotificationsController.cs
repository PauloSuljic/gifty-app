using System.Security.Claims;
using Gifty.Application.Features.Notifications.Commands;
using Gifty.Application.Features.Notifications.Queries;
using Gifty.Application.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated.");

            // Pass Firebase UID into query — let handler resolve internal ID
            var query = new GetNotificationsQuery(firebaseUid);
            var notifications = await mediator.Send(query, ct);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated.");

            var query = new GetUnreadCountQuery(firebaseUid);
            var unreadCount = await mediator.Send(query, ct);
            return Ok(unreadCount);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNotificationCommand cmd, CancellationToken ct)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized("User not authenticated.");

            // Command now accepts FirebaseUid instead of internal UserId
            var command = cmd with { UserId = firebaseUid };
            var notificationId = await mediator.Send(command, ct);
            return Ok(notificationId);
        }

        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAsRead([FromBody] MarkNotificationAsReadCommand? cmd, CancellationToken ct)
        {
            if (cmd is null || cmd.Id == Guid.Empty)
            {
                var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(firebaseUid))
                    return Unauthorized("User not authenticated.");

                var query = new GetNotificationsQuery(firebaseUid);
                var notifications = await mediator.Send(query, ct);

                foreach (var n in notifications.Where(x => !x.IsRead))
                {
                    await mediator.Send(new MarkNotificationAsReadCommand(n.Id), ct);
                }

                return Ok("All notifications marked as read.");
            }

            var result = await mediator.Send(cmd, ct);
            return result ? Ok() : NotFound("Notification not found.");
        }
    }
}