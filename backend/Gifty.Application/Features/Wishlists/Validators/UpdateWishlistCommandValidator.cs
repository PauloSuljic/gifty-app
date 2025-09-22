using FluentValidation;
using Gifty.Application.Features.Wishlists.Commands;

namespace Gifty.Application.Features.Wishlists.Validators;

public class UpdateWishlistCommandValidator : AbstractValidator<UpdateWishlistCommand>
{
    public UpdateWishlistCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Wishlist Id is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Wishlist name is required.")
            .MaximumLength(100).WithMessage("Wishlist name must not exceed 100 characters.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be zero or positive.");
    }
}