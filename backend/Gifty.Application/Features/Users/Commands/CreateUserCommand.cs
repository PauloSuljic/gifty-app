using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Users.Dtos;
using Gifty.Domain.Entities.Users;
using Gifty.Application.Common.Exceptions;

namespace Gifty.Application.Features.Users.Commands;

public record CreateUserCommand(
    string Id,
    string Username,
    string Email,
    string? Bio,
    string? AvatarUrl,
    DateOnly DateOfBirth
) : IRequest<UserDto>
{
    public class CreateUserCommandHandler(IUserRepository userRepository) : IRequestHandler<CreateUserCommand, UserDto>
    {
        public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var existingUserById = await userRepository.GetByIdAsync(request.Id);
            if (existingUserById != null)
            {
                throw new ConflictException($"User with ID '{request.Id}' already exists.");
            }

            
            var existingUserByUsername = await userRepository.GetUserByUsernameAsync(request.Username);
            if (existingUserByUsername != null)
            {
                throw new ConflictException($"Username '{request.Username}' is already taken.");
            }
            
            var existingUserByEmail = await userRepository.GetUserByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new ConflictException($"Email '{request.Email}' is already registered.");
            }

            var user = User.Create(
                request.Id,
                request.Username,
                request.Email,
                request.Bio,
                request.AvatarUrl,
                request.DateOfBirth
            );

            await userRepository.AddAsync(user);
            await userRepository.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                CreatedAt = user.CreatedAt,
                DateOfBirth = user.DateOfBirth,
            };
        }
    }
}