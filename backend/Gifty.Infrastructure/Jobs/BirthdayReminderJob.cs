using Gifty.Application.Features.Notifications.Commands;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Gifty.Infrastructure.Services;

namespace Gifty.Infrastructure.Jobs
{
    public class BirthdayReminderJob(IServiceScopeFactory scopeFactory, ILogger<BirthdayReminderJob> logger)
        : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    var birthdayService = scope.ServiceProvider.GetRequiredService<IBirthdayReminderService>();

                    var upcomingBirthdays = await birthdayService.GetUpcomingBirthdaysAsync(stoppingToken);

                    foreach (var birthday in upcomingBirthdays)
                    {
                        await mediator.Send(new CreateNotificationCommand(
                            UserId: birthday.UserId,
                            Type: "BirthdayReminder",
                            Title: $"🎂 {birthday.Name}'s birthday is in {birthday.DaysUntil} days!",
                            Message: $"Don't forget to pick something from {birthday.Name}'s wishlist!"
                        ), stoppingToken);
                    }

                    logger.LogInformation("BirthdayReminderJob executed successfully at {Time}", DateTime.UtcNow);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error running BirthdayReminderJob");
                }

                // Run daily (every 24 hours)
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}