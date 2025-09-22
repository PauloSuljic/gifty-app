using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.Users.Events
{
    public class UserUpdatedEvent(User user) : IDomainEvent
    {
        public User User { get; } = user;
    }
}