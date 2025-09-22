using System.ComponentModel.DataAnnotations;
using Gifty.Domain.Entities.Users.Events;

namespace Gifty.Domain.Entities.Users
{
    public class User : BaseEntity
    {
        [Key] public string Id { get; set; } = String.Empty;
        public string Username { get; set; } = String.Empty;
        [Required]
        public string Email { get; set; } = String.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Wishlist> Wishlists { get; set; } = new();
        
        public static User Create(string id, string username, string email, string? bio, string? avatarUrl)
        {
            var user = new User
            {
                Id = id,
                Username = username,
                Email = email,
                Bio = bio,
                AvatarUrl = avatarUrl,
                CreatedAt = DateTime.UtcNow
            };

            user.RaiseDomainEvent(new UserCreatedEvent(user));
            return user;
        }
        
        public void UpdateProfile(string username, string? bio, string? avatarUrl)
        {
            Username = username;
            Bio = bio;
            AvatarUrl = avatarUrl;

            RaiseDomainEvent(new UserUpdatedEvent(this));
        }
        
        public void MarkAsDeleted()
        {
            RaiseDomainEvent(new UserDeletedEvent(this));
        }
    }
}
