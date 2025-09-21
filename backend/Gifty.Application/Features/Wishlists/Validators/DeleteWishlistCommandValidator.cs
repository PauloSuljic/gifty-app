using FluentValidation;
using Gifty.Application.Features.Wishlists.Commands;

namespace Gifty.Application.Features.Wishlists.Validators;

public class DeleteWishlistCommandValidator : AbstractValidator<DeleteWishlistCommand>
{
    public DeleteWishlistCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Wishlist Id is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");
    }
}