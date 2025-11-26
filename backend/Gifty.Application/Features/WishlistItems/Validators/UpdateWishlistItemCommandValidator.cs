using FluentValidation;
using Gifty.Application.Features.WishlistItems.Commands;

namespace Gifty.Application.Features.WishlistItems.Validators;

public class UpdateWishlistItemCommandValidator : AbstractValidator<UpdateWishlistItemCommand>
{
    public UpdateWishlistItemCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.WishlistId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Link)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Link));
    }
}