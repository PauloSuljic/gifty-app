using FluentValidation;
using Gifty.Application.Features.SharedLinks.Commands;

namespace Gifty.Application.Features.SharedLinks.Validators;

public class GenerateShareLinkCommandValidator : AbstractValidator<GenerateShareLinkCommand>
{
    public GenerateShareLinkCommandValidator()
    {
        RuleFor(x => x.WishlistId)
            .NotEmpty().WithMessage("WishlistId is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");
    }
}