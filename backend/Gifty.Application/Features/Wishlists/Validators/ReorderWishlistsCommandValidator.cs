using FluentValidation;
using Gifty.Application.Features.Wishlists.Commands;

namespace Gifty.Application.Features.Wishlists.Validators;

public class ReorderWishlistsCommandValidator : AbstractValidator<ReorderWishlistsCommand>
{
    public ReorderWishlistsCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.ReorderedWishlists)
            .NotNull().WithMessage("Reordered wishlists cannot be null.")
            .Must(list => list.Any()).WithMessage("Reordered wishlists must contain at least one item.");

        RuleForEach(x => x.ReorderedWishlists).ChildRules(w =>
        {
            w.RuleFor(r => r.Id)
                .NotEmpty().WithMessage("Wishlist Id is required.");

            w.RuleFor(r => r.Order)
                .GreaterThanOrEqualTo(0).WithMessage("Order must be zero or positive.");
        });
    }
}