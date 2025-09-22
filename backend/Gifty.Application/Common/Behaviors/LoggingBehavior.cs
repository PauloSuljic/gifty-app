using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Gifty.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse>(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            var sw = Stopwatch.StartNew();

            try
            {
                logger.LogInformation("Handling {RequestName} with payload: {@Request}", requestName, request);

                var response = await next();

                sw.Stop();
                logger.LogInformation("Handled {RequestName} in {Elapsed}ms", requestName, sw.ElapsedMilliseconds);

                return response;
            }
            catch (Exception ex)
            {
                sw.Stop();
                logger.LogError(ex, "Error handling {RequestName} after {Elapsed}ms", requestName, sw.ElapsedMilliseconds);
                throw;
            }
        }
    }
}