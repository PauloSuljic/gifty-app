using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Gifty.Application.Common.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse>(
        IEnumerable<IValidator<TRequest>> validators,
        ILogger<ValidationBehavior<TRequest, TResponse>> logger)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (!validators.Any()) return await next(cancellationToken);
            var context = new ValidationContext<TRequest>(request);
            var failures = validators
                .Select(v => v.Validate(context))
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();

            if (failures.Count != 0)
            {
                logger.LogWarning(
                    "Validation failed for {RequestName}. Errors: {@Errors}",
                    typeof(TRequest).Name,
                    failures);

                throw new ValidationException(failures);
            }

            return await next(cancellationToken);
        }
    }
}