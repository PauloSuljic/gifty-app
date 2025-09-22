using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.Users.Events;

public class UserDeletedEvent(User user) : IDomainEvent
{
    public User User { get; } = user;
}