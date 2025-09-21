using FluentValidation;
using Gifty.Application.Features.Users.Queries;

namespace Gifty.Application.Features.Users.Validators;

public class SearchUsersQueryValidator : AbstractValidator<SearchUsersQuery>
{
    public SearchUsersQueryValidator()
    {
        RuleFor(x => x.SearchTerm)
            .NotEmpty().WithMessage("Search term cannot be empty.")
            .MinimumLength(2).WithMessage("Search term must be at least 2 characters long.");
    }
}