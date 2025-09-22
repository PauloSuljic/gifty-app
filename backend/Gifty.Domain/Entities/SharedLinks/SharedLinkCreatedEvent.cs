using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.SharedLinks;

public class SharedLinkCreatedEvent(SharedLink sharedLink) : IDomainEvent
{
    public SharedLink SharedLink { get; } = sharedLink;
}