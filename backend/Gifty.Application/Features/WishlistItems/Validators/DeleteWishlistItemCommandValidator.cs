using FluentValidation;
using Gifty.Application.Features.WishlistItems.Commands;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class DeleteWishlistItemCommandValidator : AbstractValidator<DeleteWishlistItemCommand>
{
    public DeleteWishlistItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Item Id is required.");

        RuleFor(x => x.WishlistId)
            .NotEmpty().WithMessage("WishlistId is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");
    }
}