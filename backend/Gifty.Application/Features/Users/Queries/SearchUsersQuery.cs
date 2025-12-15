using Gifty.Domain.Entities.Users;
using Gifty.Domain.Interfaces;
using MediatR;

namespace Gifty.Application.Features.Users.Queries;

public record SearchUsersQuery(string SearchTerm) : IRequest<IEnumerable<User>>;

public class SearchUsersQueryHandler(IUserRepository userRepository)
    : IRequestHandler<SearchUsersQuery, IEnumerable<User>>
{
    public async Task<IEnumerable<User>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        return await userRepository.SearchUsersAsync(request.SearchTerm);
    }
}