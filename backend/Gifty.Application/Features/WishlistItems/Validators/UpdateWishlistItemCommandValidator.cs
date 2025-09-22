using FluentValidation;
using Gifty.Application.Features.WishlistItems.Commands;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class UpdateWishlistItemCommandValidator : AbstractValidator<UpdateWishlistItemCommand>
{
    public UpdateWishlistItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Item Id is required.");

        RuleFor(x => x.WishlistId)
            .NotEmpty().WithMessage("Wishlist Id is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Item name is required.")
            .MaximumLength(100).WithMessage("Item name must not exceed 100 characters.");

        RuleFor(x => x.Link)
            .MaximumLength(500).WithMessage("Link must not exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Link));

        RuleFor(x => x.ReservedBy)
            .MaximumLength(100).WithMessage("ReservedBy must not exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.ReservedBy));
    }
}