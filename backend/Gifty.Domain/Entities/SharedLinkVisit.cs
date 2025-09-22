using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Gifty.Domain.Entities.SharedLinks;

namespace Gifty.Domain.Entities
{
    public class SharedLinkVisit : BaseEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [ForeignKey("SharedLink")]
        public Guid SharedLinkId { get; set; }
        public SharedLink? SharedLink { get; set; }

        [Required]
        public string UserId { get; private set; } = null!; 

        public DateTime VisitedAt { get; set; } = DateTime.UtcNow; 
        private SharedLinkVisit() { } // EF Core

        public SharedLinkVisit(Guid sharedLinkId, string userId)
        {
            SharedLinkId = sharedLinkId;
            UserId = userId;
            VisitedAt = DateTime.UtcNow;

            RaiseDomainEvent(new SharedLinkVisitedEvent(this));
        }
    }
}