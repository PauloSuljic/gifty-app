using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Users.Dtos;
using Gifty.Domain.Entities.Users;
using Gifty.Application.Common.Exceptions;

namespace Gifty.Application.Features.Users.Commands;

public record UpdateUserCommand(
    string Id,
    string? Username,
    string? Bio,
    string? AvatarUrl,
    DateOnly? DateOfBirth
) : IRequest<UserDto>
{
    public class UpdateUserCommandHandler(IUserRepository userRepository) : IRequestHandler<UpdateUserCommand, UserDto>
    {
        public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var existingUser = await userRepository.GetByIdAsync(request.Id);

            if (existingUser == null)
            {
                throw new NotFoundException(nameof(User), request.Id);
            }

            var usernameToPersist = string.IsNullOrWhiteSpace(request.Username)
                ? existingUser.Username
                : request.Username.Trim();

            existingUser.UpdateProfile(usernameToPersist, request.Bio, request.AvatarUrl, request.DateOfBirth);

            await userRepository.UpdateAsync(existingUser);
            await userRepository.SaveChangesAsync();

            return new UserDto
            {
                Id = existingUser.Id,
                Username = existingUser.Username,
                Email = existingUser.Email,
                AvatarUrl = existingUser.AvatarUrl,
                Bio = existingUser.Bio,
                CreatedAt = existingUser.CreatedAt,
                DateOfBirth = existingUser.DateOfBirth
            };
        }
    }
}
