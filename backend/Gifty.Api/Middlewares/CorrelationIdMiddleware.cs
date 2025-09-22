using System.Diagnostics;
using Serilog.Context;
using System.Security.Claims;

namespace gifty_web_backend.Middlewares;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string CorrelationHeader = "X-Correlation-ID";

    public async Task Invoke(HttpContext context)
    {
        // Either take incoming correlation id or generate a new one
        if (!context.Request.Headers.TryGetValue(CorrelationHeader, out var correlationId))
        {
            correlationId = Activity.Current?.Id ?? Guid.NewGuid().ToString("n");
            context.Request.Headers[CorrelationHeader] = correlationId;
        }

        context.Response.Headers[CorrelationHeader] = correlationId!;

        // Also capture current user id (if logged in)
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        // Push both CorrelationId + UserId into Serilog logging scope
        using (LogContext.PushProperty("CorrelationId", correlationId))
        using (LogContext.PushProperty("UserId", userId))
        {
            await next(context);
        }
    }
}