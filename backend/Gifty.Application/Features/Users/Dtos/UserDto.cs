namespace Gifty.Application.Features.Users.Dtos
{
    public record UserDto
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
        public string? Bio { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateOnly? DateOfBirth { get; set; }
    }
}