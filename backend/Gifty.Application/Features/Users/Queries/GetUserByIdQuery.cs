// Gifty.Application/Features/Users/Queries/GetUserById.cs
using MediatR;
using Gifty.Domain.Interfaces;
using Gifty.Application.Features.Users.Dtos;
using Gifty.Application.Common.Exceptions;
using Gifty.Domain.Entities.Users;

namespace Gifty.Application.Features.Users.Queries;

public record GetUserByIdQuery(string Id) : IRequest<UserDto>;

public class GetUserByIdHandler(IUserRepository userRepository) : IRequestHandler<GetUserByIdQuery, UserDto>
{
    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.Id);

        if (user == null)
        {
            throw new NotFoundException(nameof(User), request.Id);
        }

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            CreatedAt = user.CreatedAt,
            DateOfBirth = user.DateOfBirth
        };
    }
}