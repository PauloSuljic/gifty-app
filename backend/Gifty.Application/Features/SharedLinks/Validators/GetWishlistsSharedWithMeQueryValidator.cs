using FluentValidation;
using Gifty.Application.Features.SharedLinks.Queries;

namespace Gifty.Application.Features.SharedLinks.Validators;

public class GetWishlistsSharedWithMeQueryValidator : AbstractValidator<GetWishlistsSharedWithMeQuery>
{
    public GetWishlistsSharedWithMeQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");
    }
}