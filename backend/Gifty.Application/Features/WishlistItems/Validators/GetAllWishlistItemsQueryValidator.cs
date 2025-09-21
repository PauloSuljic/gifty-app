using FluentValidation;
using Gifty.Application.Features.WishlistItems.Queries;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class GetAllWishlistItemsQueryValidator : AbstractValidator<GetAllWishlistItemsQuery>
{
    public GetAllWishlistItemsQueryValidator()
    {
        RuleFor(x => x.WishlistId)
            .NotEmpty().WithMessage("WishlistId is required.");
    }
}