using Microsoft.EntityFrameworkCore;
using Gifty.Domain.Entities;
using Gifty.Domain.Entities.Notifications;
using Gifty.Domain.Entities.Users;
using MediatR;

namespace Gifty.Infrastructure
{
    public class GiftyDbContext : DbContext
    {
        private readonly IMediator _mediator;

        public GiftyDbContext(DbContextOptions<GiftyDbContext> options, IMediator mediator)
            : base(options)
        {
            _mediator = mediator;
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<SharedLink> SharedLinks { get; set; }
        public DbSet<SharedLinkVisit> SharedLinkVisits { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Wishlist>()
                .HasOne(w => w.User)
                .WithMany(u => u.Wishlists)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WishlistItem>()
                .HasOne(wi => wi.Wishlist)
                .WithMany(w => w.Items)
                .HasForeignKey(wi => wi.WishlistId)
                .OnDelete(DeleteBehavior.Cascade);
        }
        
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // 🔹 Dispatch domain events before committing changes
            await _mediator.DispatchDomainEvents(this);
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
} 
