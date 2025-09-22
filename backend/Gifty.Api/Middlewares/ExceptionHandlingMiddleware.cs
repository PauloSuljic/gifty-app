using System.Net;
using System.Text.Json;
using FluentValidation;
using Gifty.Application.Common.Exceptions;

namespace gifty_web_backend.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        HttpStatusCode status;
        object errors;

        switch (ex)
        {
            case BadRequestException badRequest:
                status = HttpStatusCode.BadRequest;
                errors = badRequest.Errors?.Count > 0 ? badRequest.Errors : new Dictionary<string, string[]> { { "error",
                    [badRequest.Message]
                } };
                break;
            case ValidationException validation:
                status = HttpStatusCode.BadRequest;
                errors = validation.Errors;
                break;
            case NotFoundException notFound:
                status = HttpStatusCode.NotFound;
                errors = new { error = notFound.Message };
                break;
            case ConflictException conflict:
                status = HttpStatusCode.Conflict;
                errors = new { error = conflict.Message };
                break;
            case ForbiddenAccessException forbidden:
                status = HttpStatusCode.Forbidden;
                errors = new { error = forbidden.Message };
                break;
            default:
                status = HttpStatusCode.InternalServerError;
                errors = new { error = "An unexpected error occurred." };
                break;
        }

        var result = JsonSerializer.Serialize(errors);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;
        return context.Response.WriteAsync(result);
    }
}