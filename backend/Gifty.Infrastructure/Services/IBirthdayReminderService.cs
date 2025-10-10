namespace Gifty.Infrastructure.Services
{
    public interface IBirthdayReminderService
    {
        Task<List<BirthdayUser>> GetUpcomingBirthdaysAsync(CancellationToken cancellationToken);
    }

    public record BirthdayUser(string UserId, string Name, int DaysUntil);
}