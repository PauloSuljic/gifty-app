using Gifty.Application.Features.Notifications.Commands;
using Gifty.Domain.Entities;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Gifty.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Jobs
{
    public class BirthdayReminderJob(IServiceScopeFactory scopeFactory, ILogger<BirthdayReminderJob> logger)
        : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("🎂 BirthdayReminderJob started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    var birthdayService = scope.ServiceProvider.GetRequiredService<IBirthdayReminderService>();
                    var dbContext = scope.ServiceProvider.GetRequiredService<GiftyDbContext>();

                    var today = DateTime.UtcNow.Date;

                    // ✅ Prevent duplicate execution if another instance already ran today
                    var lastRunRecord = await dbContext.SystemSettings
                        .FirstOrDefaultAsync(x => x.Key == "BirthdayReminderLastRun", stoppingToken);

                    if (lastRunRecord != null && DateTime.Parse(lastRunRecord.Value).Date == today)
                    {
                        logger.LogInformation("⏭️ BirthdayReminderJob already executed today. Skipping...");
                    }
                    else
                    {
                        var upcomingBirthdays = await birthdayService.GetUpcomingBirthdaysAsync(stoppingToken);

                        foreach (var birthday in upcomingBirthdays)
                        {
                            if (birthday.DaysUntil is 14 or 7 or 3 or 0)
                            {
                                // 🧍 Notify the birthday user
                                if (birthday.DaysUntil > 0)
                                {
                                    await mediator.Send(new CreateNotificationCommand(
                                        UserId: birthday.UserId,
                                        Type: "BirthdayReminder",
                                        Title: $"🎂 Your birthday is in {birthday.DaysUntil} day{(birthday.DaysUntil == 1 ? "" : "s")}!",
                                        Message: "Don't forget to update your wishlist so your friends can find the perfect gift!"
                                    ), stoppingToken);
                                }
                                else
                                {
                                    await mediator.Send(new CreateNotificationCommand(
                                        UserId: birthday.UserId,
                                        Type: "BirthdayReminder",
                                        Title: $"🎉 Happy Birthday!",
                                        Message: "It's your special day! Make sure your wishlist is ready for any last-minute surprises!"
                                    ), stoppingToken);
                                }

                                // 🎁 Notify friends who viewed their wishlist
                                if (birthday.FriendUserIds != null && birthday.FriendUserIds.Any())
                                {
                                    foreach (var friendId in birthday.FriendUserIds)
                                    {
                                        await mediator.Send(new CreateNotificationCommand(
                                            UserId: friendId,
                                            Type: "BirthdayReminder",
                                            Title: $"🎂 {birthday.Name}'s birthday is in {birthday.DaysUntil} day{(birthday.DaysUntil == 1 ? "" : "s")}!",
                                            Message: $"Don't forget to pick something from {birthday.Name}'s wishlist!"
                                        ), stoppingToken);
                                    }
                                }
                            }
                        }

                        // ✅ Record that the job executed today
                        if (lastRunRecord == null)
                        {
                            dbContext.SystemSettings.Add(new SystemSetting
                            {
                                Key = "BirthdayReminderLastRun",
                                Value = today.ToString("yyyy-MM-dd")
                            });
                        }
                        else
                        {
                            lastRunRecord.Value = today.ToString("yyyy-MM-dd");
                        }

                        await dbContext.SaveChangesAsync(stoppingToken);
                        logger.LogInformation("✅ BirthdayReminderJob executed successfully at {Time}", DateTime.UtcNow);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "❌ Error running BirthdayReminderJob");
                }

                // 🕘 Wait until next fixed 09:00 UTC run
                var now = DateTime.UtcNow;
                var nextRunTime = now.Date.AddDays(1).AddHours(9);
                var delay = nextRunTime - now;

                if (delay.TotalMilliseconds < 0)
                    delay = TimeSpan.FromDays(1);

                logger.LogInformation("Next BirthdayReminderJob scheduled in {DelayHours} hours.", delay.TotalHours);
                await Task.Delay(delay, stoppingToken);
            }
        }
    }
}