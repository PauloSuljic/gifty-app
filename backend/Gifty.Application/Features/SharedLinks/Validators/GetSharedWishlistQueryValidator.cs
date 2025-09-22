using FluentValidation;
using Gifty.Application.Features.SharedLinks.Queries;

namespace Gifty.Application.Features.SharedLinks.Validators;

public class GetSharedWishlistQueryValidator : AbstractValidator<GetSharedWishlistQuery>
{
    public GetSharedWishlistQueryValidator()
    {
        RuleFor(x => x.ShareCode)
            .NotEmpty().WithMessage("ShareCode is required.");
    }
}