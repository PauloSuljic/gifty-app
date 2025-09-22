using Gifty.Domain.Common.Events;

namespace Gifty.Domain.Entities.SharedLinks;

public class SharedLinkVisitedEvent(SharedLinkVisit visit) : IDomainEvent
{
    public SharedLinkVisit Visit { get; } = visit;
}