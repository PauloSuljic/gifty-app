using FluentValidation;
using Gifty.Application.Features.Wishlists.Queries;

namespace Gifty.Application.Features.Wishlists.Validators;

public class GetWishlistByIdQueryValidator : AbstractValidator<GetWishlistByIdQuery>
{
    public GetWishlistByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Wishlist Id must not be empty.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id must not be empty.");
    }
}