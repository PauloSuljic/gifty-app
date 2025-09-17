// Gifty.Application/Features/Users/Commands/UpdateUser.cs
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Users.Dtos;
using Gifty.Application.Common.Exceptions; // For NotFoundException, ConflictException
using Gifty.Domain.Entities; // For User entity reference

namespace Gifty.Application.Features.Users.Commands;

public record UpdateUserCommand(
    string Id,
    string Username,
    string? Bio,
    string? AvatarUrl
) : IRequest<UserDto>;

public class UpdateUserHandler(IUserRepository userRepository) : IRequestHandler<UpdateUserCommand, UserDto>
{
    public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await userRepository.GetByIdAsync(request.Id);

        if (existingUser == null)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }
        
        if (existingUser.Username != request.Username)
        {
            var userWithSameUsername = await userRepository.GetUserByUsernameAsync(request.Username);
            if (userWithSameUsername != null)
            {
                throw new ConflictException($"Username '{request.Username}' is already taken by another user.");
            }
        }

        existingUser.Username = request.Username;
        existingUser.Bio = request.Bio;
        existingUser.AvatarUrl = request.AvatarUrl;

        await userRepository.UpdateAsync(existingUser);
        await userRepository.SaveChangesAsync();

        return new UserDto
        {
            Id = existingUser.Id,
            Username = existingUser.Username,
            Email = existingUser.Email,
            AvatarUrl = existingUser.AvatarUrl,
            Bio = existingUser.Bio,
            CreatedAt = existingUser.CreatedAt
        };
    }
}