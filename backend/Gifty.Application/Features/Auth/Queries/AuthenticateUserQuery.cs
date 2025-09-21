using MediatR;
using Gifty.Domain.Interfaces; 
using Gifty.Application.Features.Users.Dtos; 

namespace Gifty.Application.Features.Auth.Queries;

public record AuthenticateUserQuery(string Token) : IRequest<UserDto?>;

public class AuthenticateUserHandler(IFirebaseAuthService firebaseAuthService)
    : IRequestHandler<AuthenticateUserQuery, UserDto?>
{
    public async Task<UserDto?> Handle(AuthenticateUserQuery request, CancellationToken cancellationToken)
    {
        var userEntity = await firebaseAuthService.AuthenticateUserAsync(request.Token);

        if (userEntity == null)
        {
            return null;
        }
        
        return new UserDto
        {
            Id = userEntity.Id,
            Username = userEntity.Username,
            Email = userEntity.Email,
            AvatarUrl = userEntity.AvatarUrl,
            Bio = userEntity.Bio,
            CreatedAt = userEntity.CreatedAt
        };
    }
}