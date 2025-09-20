using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Gifty.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

        public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        {
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            var sw = Stopwatch.StartNew();

            try
            {
                _logger.LogInformation("Handling {RequestName} with payload: {@Request}", requestName, request);

                var response = await next();

                sw.Stop();
                _logger.LogInformation("Handled {RequestName} in {Elapsed}ms", requestName, sw.ElapsedMilliseconds);

                return response;
            }
            catch (Exception ex)
            {
                sw.Stop();
                _logger.LogError(ex, "Error handling {RequestName} after {Elapsed}ms", requestName, sw.ElapsedMilliseconds);
                throw;
            }
        }
    }
}