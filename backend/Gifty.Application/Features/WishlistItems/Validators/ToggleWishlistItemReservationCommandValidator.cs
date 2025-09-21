using FluentValidation;
using Gifty.Application.Features.WishlistItems.Commands;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class ToggleWishlistItemReservationCommandValidator : AbstractValidator<ToggleWishlistItemReservationCommand>
{
    public ToggleWishlistItemReservationCommandValidator()
    {
        RuleFor(x => x.ItemId)
            .NotEmpty().WithMessage("ItemId is required.");

        RuleFor(x => x.WishlistId)
            .NotEmpty().WithMessage("WishlistId is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .MaximumLength(128).WithMessage("UserId must not exceed 128 characters.");
    }
}