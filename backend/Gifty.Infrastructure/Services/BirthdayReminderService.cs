using Microsoft.EntityFrameworkCore;

namespace Gifty.Infrastructure.Services;

public class BirthdayReminderService(GiftyDbContext dbContext) : IBirthdayReminderService
{
    public async Task<List<BirthdayUser>> GetUpcomingBirthdaysAsync(CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var allUsers = await dbContext.Users
            .Where(u => true)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.DateOfBirth
            })
            .ToListAsync(cancellationToken);

        var upcoming = new List<BirthdayUser>();

        foreach (var user in allUsers)
        {
            var nextBirthday = new DateTime(today.Year, user.DateOfBirth.Month, user.DateOfBirth.Day);

            // If birthday already passed this year, shift to next year
            if (nextBirthday < today)
                nextBirthday = nextBirthday.AddYears(1);

            var daysUntil = (nextBirthday - today).Days;

            // Only include birthdays within the next 7 days
            if (daysUntil <= 7)
            {
                upcoming.Add(new BirthdayUser(user.Id, user.Username, daysUntil));
            }
        }

        return upcoming;
    }
}