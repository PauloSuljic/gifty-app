using Gifty.Domain.Entities;
using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Users.Queries;

public record GetAllUsersQuery : IRequest<IEnumerable<User>>;

public class GetAllUsersQueryHandler(IUserRepository userRepository)
    : IRequestHandler<GetAllUsersQuery, IEnumerable<User>>
{
    public async Task<IEnumerable<User>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        return await userRepository.GetAllUsersAsync();
    }
}