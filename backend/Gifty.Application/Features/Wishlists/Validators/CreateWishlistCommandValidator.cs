using FluentValidation;
using Gifty.Application.Features.Wishlists.Commands;

namespace Gifty.Application.Features.Wishlists.Validators;

public class CreateWishlistCommandValidator : AbstractValidator<CreateWishlistCommand>
{
    public CreateWishlistCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Wishlist name is required.")
            .MaximumLength(100).WithMessage("Wishlist name cannot exceed 100 characters.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be a positive number.");
    }
}