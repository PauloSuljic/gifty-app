using FluentValidation;
using Gifty.Application.Features.Wishlists.Queries;

namespace Gifty.Application.Features.Wishlists.Validators;

public class GetWishlistsByUserIdQueryValidator : AbstractValidator<GetWishlistsByUserIdQuery>
{
    public GetWishlistsByUserIdQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id must not be empty.");
    }
}