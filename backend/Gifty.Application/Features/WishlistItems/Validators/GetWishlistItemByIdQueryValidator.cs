using FluentValidation;
using Gifty.Application.Features.WishlistItems.Queries;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class GetWishlistItemByIdQueryValidator : AbstractValidator<GetWishlistItemByIdQuery>
{
    public GetWishlistItemByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Wishlist Item Id is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .MaximumLength(128).WithMessage("UserId must not exceed 128 characters.");
    }
}