using FluentValidation;
using Gifty.Application.Features.WishlistItems.Commands;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class UpdateWishlistItemPartialCommandValidator : AbstractValidator<UpdateWishlistItemPartialCommand>
{
    public UpdateWishlistItemPartialCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Item Id is required.");

        RuleFor(x => x.WishlistId)
            .NotEmpty().WithMessage("Wishlist Id is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id is required.");

        RuleFor(x => x.Name)
            .MaximumLength(100).WithMessage("Item name must not exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Name));

        RuleFor(x => x.Link)
            .MaximumLength(500).WithMessage("Link must not exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Link));
    }
}